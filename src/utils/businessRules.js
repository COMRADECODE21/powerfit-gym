/**
 * ============================================================================
 * MÓDULO DE REGLAS DE NEGOCIO PURAS - POWERFIT GYM
 * ============================================================================
 * Este archivo concentra la lógica de negocio del gimnasio implementada como
 * funciones puras (sin efectos secundarios ni llamadas directas a APIs).
 * Cada regla está documentada con JSDoc y cita el identificador oficial (R1 - R5).
 */

/**
 * REGLA R1 & REGLA R5: Límite de Pases de Invitado por Membresía
 * ----------------------------------------------------------------------------
 * @rule R1: Si la membresía solo incluye servicio tipo "Acceso" (o 1 solo producto),
 *           el límite es de máximo 2 pases de invitado.
 *           Si incluye 2 o más productos, el límite asciende a 5 pases de invitado.
 * @rule R5: Si es la primera membresía del socio (es_primera === true),
 *           se otorga un pase bono adicional (+1) sumado al límite de R1.
 * 
 * @param {Array<Object>} productos - Lista de productos seleccionados en la membresía.
 * @param {boolean} esPrimeraMembresia - Indica si el socio no tiene membresías previas.
 * @returns {{
 *   limiteTotal: number,
 *   limiteBase: number,
 *   bonoPrimeraVez: number,
 *   mensaje: string,
 *   desglose: string
 * }} Resultado del cálculo del límite de pases.
 */
export function calcularLimitePases(productos = [], esPrimeraMembresia = false) {
  const cantidadProductos = productos.length;

  if (cantidadProductos === 0) {
    return {
      limiteTotal: 0,
      limiteBase: 0,
      bonoPrimeraVez: 0,
      mensaje: 'Debe seleccionar al menos un producto para habilitar pases de invitado.',
      desglose: '0 pases',
    };
  }

  // R1: 1 producto = 2 pases; 2 o más productos = 5 pases
  const limiteBase = cantidadProductos >= 2 ? 5 : 2;
  const bonoPrimeraVez = esPrimeraMembresia ? 1 : 0;
  const limiteTotal = limiteBase + bonoPrimeraVez;

  const desglose = esPrimeraMembresia
    ? `${limiteBase} pases (R1: ${cantidadProductos} prod.) + 1 pase de bienvenida (R5: primera membresía) = ${limiteTotal} pases`
    : `${limiteBase} pases (R1: ${cantidadProductos} prod.)`;

  return {
    limiteTotal,
    limiteBase,
    bonoPrimeraVez,
    mensaje: `Límite calculado: ${limiteTotal} pases de invitado (${desglose}).`,
    desglose,
  };
}

/**
 * REGLA R4: Descuento por Volumen de Productos en Membresía
 * ----------------------------------------------------------------------------
 * @rule R4: Si la membresía tiene 4 o más productos contratados,
 *           monto_total = suma * 0.85 (aplica 15% de descuento automático).
 *           Si tiene menos de 4 productos, monto_total = suma sin descuento.
 * 
 * @param {Array<Object>} productos - Lista de productos a contratar con su precio_base.
 * @returns {{
 *   subtotal: number,
 *   porcentajeDescuento: number,
 *   montoDescuento: number,
 *   montoTotal: number,
 *   aplicaDescuento: boolean,
 *   mensaje: string
 * }} Desglose financiero para facturación.
 */
export function calcularMontoMembresia(productos = []) {
  const subtotal = productos.reduce((acc, p) => acc + (Number(p.precio_base) || 0), 0);
  const cantidad = productos.length;
  const aplicaDescuento = cantidad >= 4;
  const porcentajeDescuento = aplicaDescuento ? 15 : 0;
  const montoDescuento = aplicaDescuento ? subtotal * 0.15 : 0;
  const montoTotal = subtotal - montoDescuento;

  const mensaje = aplicaDescuento
    ? `¡Descuento del 15% aplicado por contratar ${cantidad} productos! (Regla R4)`
    : cantidad > 0
    ? `Agrega ${4 - cantidad} producto(s) más para acceder al 15% de descuento por volumen (Regla R4).`
    : 'Seleccione productos para calcular el monto.';

  return {
    subtotal: Number(subtotal.toFixed(2)),
    porcentajeDescuento,
    montoDescuento: Number(montoDescuento.toFixed(2)),
    montoTotal: Number(montoTotal.toFixed(2)),
    aplicaDescuento,
    mensaje,
  };
}

/**
 * REGLA R5: Detección de Primera Membresía de un Socio
 * ----------------------------------------------------------------------------
 * @rule R5: Si el socio no registra membresías previas en el sistema,
 *           es_primera = true.
 * 
 * @param {Array<Object>} membresiasSocio - Historial de membresías registradas para el socio.
 * @returns {{
 *   esPrimera: boolean,
 *   totalPrevias: number,
 *   mensaje: string
 * }} Resultado de evaluación.
 */
export function evaluarPrimeraMembresia(membresiasSocio = []) {
  const totalPrevias = membresiasSocio.length;
  const esPrimera = totalPrevias === 0;

  return {
    esPrimera,
    totalPrevias,
    mensaje: esPrimera
      ? '¡Primera membresía del socio! Califica para +1 pase bono de bienvenida (Regla R5).'
      : `El socio registra ${totalPrevias} membresía(s) anterior(es).`,
  };
}

/**
 * Validación de Membresía Vigente para Ingreso o Emisión de Pases
 * ----------------------------------------------------------------------------
 * Evalúa si el socio cuenta con una membresía activa cuya fecha_fin sea
 * mayor o igual a la fecha de hoy.
 * 
 * @param {Array<Object>} membresiasSocio - Lista de membresías del socio.
 * @param {string} fechaReferencia - Fecha YYYY-MM-DD (por defecto hoy).
 * @returns {{
 *   vigente: boolean,
 *   membresiaActiva: Object|null,
 *   mensaje: string
 * }}
 */
export function validarMembresiaVigente(membresiasSocio = [], fechaReferencia = null) {
  const hoyStr = fechaReferencia || new Date().toISOString().split('T')[0];

  const membresiaActiva = membresiasSocio.find((m) => {
    return m.estado === 'activa' && m.fecha_fin >= hoyStr;
  });

  if (membresiaActiva) {
    return {
      vigente: true,
      membresiaActiva,
      mensaje: `Membresía activa vigente hasta el ${membresiaActiva.fecha_fin}.`,
    };
  }

  return {
    vigente: false,
    membresiaActiva: null,
    mensaje: 'El socio no cuenta con ninguna membresía activa y vigente a la fecha.',
  };
}

/**
 * Validación de Emisión de Pase de Invitado
 * ----------------------------------------------------------------------------
 * Combina la validación de membresía vigente con el límite disponible (R1 + R5)
 * y la cantidad de pases ya consumidos en el período.
 * 
 * @param {Object} params
 * @param {Object} params.socio - Datos del socio.
 * @param {Object|null} params.membresiaVigente - Membresía activa del socio.
 * @param {number} params.limitePases - Límite permitido según R1 y R5.
 * @param {number} params.pasesUsados - Pases ya registrados.
 * @returns {{
 *   permitido: boolean,
 *   pasesRestantes: number,
 *   mensaje: string
 * }}
 */
export function validarEmisionPase({ socio, membresiaVigente, limitePases = 0, pasesUsados = 0 }) {
  if (!socio) {
    return { permitido: false, pasesRestantes: 0, mensaje: 'Debe seleccionar un socio.' };
  }

  if (!socio.activo) {
    return { permitido: false, pasesRestantes: 0, mensaje: 'El socio está inactivo en el sistema.' };
  }

  if (!membresiaVigente) {
    return { permitido: false, pasesRestantes: 0, mensaje: 'El socio no tiene una membresía vigente activa.' };
  }

  const pasesRestantes = Math.max(0, limitePases - pasesUsados);

  if (pasesRestantes <= 0) {
    return {
      permitido: false,
      pasesRestantes: 0,
      mensaje: `Límite alcanzado: el socio ya utilizó todos sus pases (${pasesUsados} de ${limitePases}).`,
    };
  }

  return {
    permitido: true,
    pasesRestantes,
    mensaje: `Pase autorizado. Pases disponibles: ${pasesRestantes} de ${limitePases}.`,
  };
}
