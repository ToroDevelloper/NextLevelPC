const express = require('express');
const router = express.Router();
const CitaServicioService = require('../services/CitaServicioService');

// DASHBOARD DE SERVICIOS (CITAS)
router.get('/', async (req, res) => {
  try {
    const citas = await CitaServicioService.getAllCitas();
    res.render('dashboard/citas', { citas: Array.isArray(citas) ? citas : [] });
  } catch (error) {
    console.error('Error cargando dashboard de servicios:', error.message);
    res.status(500).send('<h1>Error cargando dashboard de servicios</h1>');
  }
});

module.exports = router;