export interface LaptopProduct {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  specs: string[];
  condition: string;
  detailUrl: string;
}

// Static product data sourced from balisalecomputer.id/products
// Last updated: 2026-04-06
const STATIC_PRODUCTS: LaptopProduct[] = [
  {
    id: "bsc-163",
    name: "Lenovo Ideapad Slim 1 14ADA7",
    brand: "LENOVO",
    price: "Rp 1.950.000",
    image: "https://balisalecomputer.id/storage/products/Wkk14X5hBmxtGP9egb9zTpjFRyJQ38Pau6ryeTVA.jpg",
    specs: ["AMD 3020E", "8 GB RAM", "256 GB SSD", "Radeon"],
    condition: "Excellent",
    detailUrl: "https://balisalecomputer.id/product/163",
  },
  {
    id: "bsc-162",
    name: "HP 15 - EF0875MS",
    brand: "HP",
    price: "Rp 3.900.000",
    image: "https://balisalecomputer.id/storage/products/gXzxvFJW9YaKdOuVLoqCM9dR8Hk8lKD9Pnyf5oEB.jpg",
    specs: ["AMD Ryzen 7 - 3700U", "8 GB RAM", "256 GB SSD", "Radeon"],
    condition: "Excellent",
    detailUrl: "https://balisalecomputer.id/product/162",
  },
  {
    id: "bsc-161",
    name: "ASUS VivoBook PRO 14 OLED M3400Q",
    brand: "ASUS",
    price: "Rp 4.800.000",
    image: "https://balisalecomputer.id/storage/products/szqC6ToFw1c9hyGEAfHbjcuTGeWcTfqSWME0CN1L.jpg",
    specs: ["AMD Ryzen 5 - 5600H", "8 GB RAM", "512 GB SSD", "Radeon"],
    condition: "Excellent",
    detailUrl: "https://balisalecomputer.id/product/161",
  },
  {
    id: "bsc-159",
    name: "Lenovo Thinkpad X390 Yoga",
    brand: "LENOVO",
    price: "Rp 4.950.000",
    image: "https://balisalecomputer.id/storage/products/wcOEGeHE6xJfkgazB3zM5soe3LGD7o61KXSKLMO6.jpg",
    specs: ["Intel Core i5 - 8265U", "16 GB RAM", "256 GB SSD", "Intel UHD Graphics"],
    condition: "Excellent",
    detailUrl: "https://balisalecomputer.id/product/159",
  },
  {
    id: "bsc-158",
    name: "Lenovo Thinkpad X380 Yoga",
    brand: "LENOVO",
    price: "Rp 4.600.000",
    image: "https://balisalecomputer.id/storage/products/LEHsbwWqjbAKX2atvCJuyG2CSsRVv9BMup4e37k2.jpg",
    specs: ["Intel Core i5 - 8250U", "8 GB RAM", "256 GB SSD", "Intel UHD Graphics"],
    condition: "Excellent",
    detailUrl: "https://balisalecomputer.id/product/158",
  },
  {
    id: "bsc-157",
    name: "Lenovo Thinkpad T490",
    brand: "LENOVO",
    price: "Rp 3.950.000",
    image: "https://balisalecomputer.id/storage/products/08umvNMQmbRx2gUZmFGkXT8ItB5HJaqwMxOsI0Ze.jpg",
    specs: ["Intel Core i5 - 8265U", "8 GB RAM", "256 GB SSD", "Intel UHD Graphics"],
    condition: "Excellent",
    detailUrl: "https://balisalecomputer.id/product/157",
  },
  {
    id: "bsc-156",
    name: "Lenovo Thinkpad L480",
    brand: "LENOVO",
    price: "Rp 3.600.000",
    image: "https://balisalecomputer.id/storage/products/VxrvJKnOi1HIxtN2to51ECgilHXBI5MqQVqwaDa1.jpg",
    specs: ["Intel Core i5 - 8250U", "8 GB RAM", "128 GB SSD", "Intel UHD Graphics"],
    condition: "Excellent",
    detailUrl: "https://balisalecomputer.id/product/156",
  },
  {
    id: "bsc-126",
    name: "Lenovo Thinkpad L13",
    brand: "LENOVO",
    price: "Rp 4.850.000",
    image: "https://balisalecomputer.id/storage/products/W8jybO0dOdCRBdevaMUPx3xXfInAEeeq0RtHSuzc.jpg",
    specs: ["Intel Core i5 - 1135G7", "8 GB", "256 GB", "Intel Iris Xe"],
    condition: "Excellent",
    detailUrl: "https://balisalecomputer.id/product/126",
  },
];

export async function fetchLaptopProducts(): Promise<LaptopProduct[]> {
  return STATIC_PRODUCTS;
}
