import assert from 'node:assert/strict';

// Always use a fresh in-memory database; never change stored event data.
process.env.EVENT_DB_PATH = ':memory:';
const db = await import('../src/db/init.ts');

const guest = db.createParticipant({
  name: 'CI Guest', food_order: 'Lunch', coffee_order: 'Tea',
});
assert.equal(db.getAllParticipants().length, 1);
assert.equal(guest.food_taken, false);
assert.equal(guest.coffee_taken, false);
assert.equal(db.markFoodTaken(guest.id).food_taken, true);
assert.equal(db.markCoffeeTaken(guest.id).coffee_taken, true);
assert.equal(db.updateParticipant(guest.id, { name: 'Updated Guest' }).name, 'Updated Guest');
assert.equal(db.getParticipant(guest.id).food_taken, true);
assert.equal(db.deleteParticipant(guest.id), true);
assert.equal(db.getParticipant(guest.id), null);
assert.deepEqual(db.getAllParticipants(), []);
assert.equal(db.getParticipant('missing'), null);
console.log('Database checks passed: create, read, update, food/coffee collection, delete, and missing records.');
