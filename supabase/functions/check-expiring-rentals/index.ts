import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FONNTE_TOKEN = Deno.env.get("FONNTE_TOKEN");
const ADMIN_WHATSAPP = "6283891088084";

const REMINDER_HOURS_BEFORE = 4;
const CATCH_UP_HOURS = 24;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

function formatDate(date: string) {
  return new Date(`${date}T00:00:00+07:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (!FONNTE_TOKEN) {
      throw new Error("FONNTE_TOKEN belum diset");
    }

    const now = new Date();

    console.log("====================================");
    console.log("NOW UTC :", now.toISOString());
    console.log("NOW ISO :", now.toString());
    console.log("====================================");

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        id,
        customer_name,
        whatsapp,
        laptop_name,
        end_date,
        end_time,
        status,
        admin_notified_at
      `)
      .in("status", ["confirmed", "active"])
      .gte("end_date", ymd(yesterday))
      .lte("end_date", ymd(tomorrow))
      .is("admin_notified_at", null);

    if (error) throw error;

    console.log("Jumlah booking:", bookings?.length ?? 0);

    if (!bookings || bookings.length === 0) {
      return Response.json({
        ok: true,
        sent: 0,
        message: "Tidak ada booking",
      });
    }

    const dueBookings = [];

    for (const booking of bookings) {
      const time = booking.end_time ?? "23:59:00";

      // pastikan format HH:mm:ss
      const fullTime =
        time.length === 5 ? `${time}:00` : time;

      // pakai local datetime
      const deadline = new Date(
        `${booking.end_date}T${fullTime}+07:00`
      );

      const hoursLeft =
        (deadline.getTime() - now.getTime()) /
        (1000 * 60 * 60);

      console.log("--------------------------------");
      console.log("Customer :", booking.customer_name);
      console.log("Deadline :", deadline.toISOString());
      console.log("HoursLeft:", hoursLeft);
      console.log("--------------------------------");

      if (
        hoursLeft <= REMINDER_HOURS_BEFORE &&
        hoursLeft >= -CATCH_UP_HOURS
      ) {
        dueBookings.push({
          ...booking,
          deadline,
          hoursLeft,
        });
      }
    }

    console.log("Booking yang masuk reminder:", dueBookings.length);

    if (dueBookings.length === 0) {
      return Response.json({
        ok: true,
        sent: 0,
        message: "Belum ada booking H-4 jam",
      });
    }

    let sent = 0;

    for (const booking of dueBookings) {
      const message = `Dear ${booking.customer_name} 👋

Kami dari *TeknoKerja.com Rental Laptop*.

Kami ingin mengingatkan bahwa masa sewa laptop Anda akan segera berakhir sekitar *4 jam lagi*.

💻 Laptop
${booking.laptop_name ?? "-"}

📅 Tanggal selesai
${formatDate(booking.end_date)}

🕒 Jam
${booking.end_time ?? "-"}

Apabila ingin memperpanjang masa sewa, silakan balas pesan ini atau hubungi admin kami.

Terima kasih 🙏`;

      const response = await fetch(
        "https://api.fonnte.com/send",
        {
          method: "POST",
          headers: {
            Authorization: FONNTE_TOKEN,
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
          target: booking.whatsapp,
          message,
        }),
        },
      );
      console.log("Mengirim ke:", booking.whatsapp);
      const result = await response.json();

      console.log("Fonnte:", result);

      if (response.ok && result.status !== false) {
        sent++;

        await supabase
          .from("bookings")
          .update({
            admin_notified_at: new Date().toISOString(),
          })
          .eq("id", booking.id);
      }
    }

    return Response.json({
      ok: true,
      total: bookings.length,
      due: dueBookings.length,
      sent,
    });
  } catch (err) {
    console.error(err);

    return Response.json(
      {
        ok: false,
        error: String(err),
      },
      {
        status: 500,
      },
    );
  }
});