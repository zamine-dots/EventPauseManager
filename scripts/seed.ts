import { initializeDatabase, createParticipant } from '@/db/init';
import { generateQRCodeBase64, getScanUrl } from '@/lib/qrcode';

// Example data
const exampleParticipants = [
  { name: 'Alice Johnson', food_order: 'Pasta Carbonara', coffee_order: 'Espresso' },
  { name: 'Bob Smith', food_order: 'Caesar Salad', coffee_order: 'Cappuccino' },
  { name: 'Charlie Brown', food_order: 'Grilled Cheese', coffee_order: 'Latte' },
  { name: 'Diana Prince', food_order: 'Quinoa Bowl', coffee_order: 'Macchiato' },
  { name: 'Eve Wilson', food_order: 'Burger & Fries', coffee_order: 'Americano' },
  { name: 'Frank Miller', food_order: 'Chicken Wings', coffee_order: 'Cappuccino' },
  { name: 'Grace Lee', food_order: 'Vegetarian Pizza', coffee_order: 'Flat White' },
  { name: 'Henry Davis', food_order: 'Sous Vide Steak', coffee_order: 'Espresso Con Panna' },
];

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Initialize database
    initializeDatabase();

    // Create participants
    for (const participant of exampleParticipants) {
      const created = createParticipant({
        name: participant.name,
        food_order: participant.food_order,
        coffee_order: participant.coffee_order,
      });

      // Generate QR code
      const qrText = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/scan/${created.id}`;
      const qrCode = await generateQRCodeBase64(qrText);
      
      console.log(`✅ Added: ${created.name}`);
    }

    console.log('✨ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
