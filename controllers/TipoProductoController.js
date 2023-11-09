const Sequelize = require('sequelize');
const {buildResponse, errorResponse} = require("../utils/Utils");
const {Producto} = require("../models");
const TipoProducto = require('../models').TipoProducto;

module.exports = {

    async Create (req, res) {
  try {
    const { nombre } = req.body;

    const tipoProducto = await TipoProducto.create({ nombre });
    res.status(200).send({ message: 'Tipo de producto creado correctamente', data: tipoProducto });
  } catch (error) {
    res.status(400).send({ error: 'Error al crear tipo de producto', details: error.message });
  }
},
    async deleteTipoProducto (req, res)  {
  try {
    const tipoProductoId = req.params.id;

    const resultado = await TipoProducto.destroy({ where: { id: tipoProductoId } });

    if (resultado === 1) {
      res.status(200).send({ message: 'Tipo de producto eliminado correctamente' });
    } else {
      res.status(404).send({ error: 'No se encontró el tipo de producto con el ID especificado' });
    }
  } catch (error) {
    res.status(400).send({ error: 'Error al eliminar tipo de producto', details: error.message });
  }
},

// Modificación (Update)
 async update (req, res) {
  try {
    const tipoProductoId = req.params.id;
    const { nombre } = req.body;

    const resultado = await TipoProducto.update({ nombre }, { where: { id: tipoProductoId } });

    if (resultado[0] === 1) {
      res.status(200).send({ message: 'Tipo de producto actualizado correctamente' });
    } else {
      res.status(404).send({ error: 'No se encontró el tipo de producto con el ID especificado' });
    }
  } catch (error) {
    res.status(400).send({ error: 'Error al actualizar tipo de producto', details: error.message });
  }
},


    list(req, res) {
        return TipoProducto.findAll({
            attributes: {exclude: ['createdAt', 'updatedAt']}
        })
            .then(TipoProducto => res.status(200).send(buildResponse(TipoProducto)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    find(req, res) {
        return TipoProducto.findAll({
            where: {
                id: req.params.id,
            }
        })
            .then(TipoProducto => res.status(200).send(buildResponse(TipoProducto)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },
};