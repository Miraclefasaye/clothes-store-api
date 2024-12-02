const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Insert 10 product rows
  for (let i = 1; i <= 10; i++) {
    await prisma.product.create({
      data: {
        name: `Product ${i}`,
        description: `Description for Product ${i}`,
        cost: (Math.random() * (100 - 10) + 10).toFixed(2), // Random cost between 10 and 100
        image_filename: `pic${i}.jpg`,
      },
    });
  }

  console.log("Inserted 10 products.");
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
