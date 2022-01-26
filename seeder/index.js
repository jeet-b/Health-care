const service = require('../services/seeder');

async function initSeed() {
    try {
        await service.seedRoles();
        await service.seedUsers();
        await service.assignPermissionAdmin();
    } catch (e) {
        console.log('Seed data failed!', e);
    }
}

module.exports = initSeed;
