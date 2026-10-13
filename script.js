const datosIniciales = {
    habitaciones: [
        {
            numero: "101",
            tipo: "Simple",
            piso: "1",
            capacidad: "1",
            precio: 80,
            estado: "Disponible",
            descripcion: "Habitación simple con baño privado",
        },
        {
            numero: "102",
            tipo: "Doble",
            piso: "1",
            capacidad: "2",
            precio: 130,
            estado: "Disponible",
            descripcion: "Habitación doble para dos personas",
        },
        {
            numero: "201",
            tipo: "Matrimonial",
            piso: "2",
            capacidad: "2",
            precio: 160,
            estado: "Disponible",
            descripcion: "Habitación matrimonial con buena vista",
        },
    ],
    huespedes: [
        {
            dni: "74859612",
            nombre: "Luis Paredes",
            telefono: "987654321",
            correo: "luis@gmail.com",
            direccion: "Cusco",
        },
    ],
    reservas: [],
    pagos: [],
};

let habitaciones = cargarDato("habitaciones", datosIniciales.habitaciones);
let huespedes = cargarDato("huespedes", datosIniciales.huespedes);
let reservas = cargarDato("reservas", datosIniciales.reservas);
let pagos = cargarDato("pagos", datosIniciales.pagos);

function cargarDato(nombre, valorInicial) {
    let guardado = localStorage.getItem("hotel_" + nombre);

    if (guardado) {
        return JSON.parse(guardado);
    }

    return valorInicial;
}

function guardarDatos() {
    localStorage.setItem("hotel_habitaciones", JSON.stringify(habitaciones));
    localStorage.setItem("hotel_huespedes", JSON.stringify(huespedes));
    localStorage.setItem("hotel_reservas", JSON.stringify(reservas));
    localStorage.setItem("hotel_pagos", JSON.stringify(pagos));
}

function cambiarVista(nombreVista) {
    document.querySelectorAll(".vista").forEach((vista) => {
        vista.classList.remove("activa");
    });

    document.querySelectorAll(".nav").forEach((boton) => {
        boton.classList.remove("activo");
    });

    document.getElementById(nombreVista).classList.add("activa");
    document.querySelector(`[data-vista="${nombreVista}"]`).classList.add("activo");
}

function calcularNoches(entrada, salida) {
    let fechaEntrada = new Date(entrada);
    let fechaSalida = new Date(salida);
    let diferencia = fechaSalida - fechaEntrada;
    let noches = diferencia / (1000 * 60 * 60 * 24);

    if (noches <= 0) {
        return 0;
    }

    return noches;
}

function habitacionDisponible(numero, entrada, salida) {
    let habitacion = habitaciones.find((item) => item.numero === numero);

    if (!habitacion || habitacion.estado === "Mantenimiento") {
        return false;
    }

    for (let reserva of reservas) {
        if (reserva.habitacion === numero && reserva.estado === "Activa") {
            if (entrada < reserva.salida && salida > reserva.entrada) {
                return false;
            }
        }
    }

    return true;
}

function calcularIngresos() {
    let total = 0;

    for (let pago of pagos) {
        total = total + Number(pago.monto);
    }

    return total;
}

function contarPorEstado(estado) {
    return habitaciones.filter((habitacion) => habitacion.estado === estado).length;
}

function crearBadge(texto) {
    let clase = texto.toLowerCase();
    return `<span class="badge ${clase}">${texto}</span>`;
}

function mostrarMensaje(texto, tipo = "ok") {
    let mensaje = document.getElementById("mensajeReserva");
    mensaje.textContent = texto;
    mensaje.classList.remove("oculto", "error");

    if (tipo === "error") {
        mensaje.classList.add("error");
    }
}

function actualizarSelects() {
    let selectHuesped = document.getElementById("huespedReserva");
    let selectHabitacion = document.getElementById("habitacionReserva");
    let selectReservaPago = document.getElementById("reservaPago");

    selectHuesped.innerHTML = '<option value="">Seleccione huésped</option>';
    selectHabitacion.innerHTML = '<option value="">Seleccione habitación</option>';
    selectReservaPago.innerHTML = '<option value="">Seleccione reserva</option>';

    for (let huesped of huespedes) {
        selectHuesped.innerHTML += `<option value="${huesped.nombre}">${huesped.nombre} - DNI: ${huesped.dni}</option>`;
    }

    for (let habitacion of habitaciones) {
        let texto = `Habitación ${habitacion.numero} - ${habitacion.tipo} - S/ ${habitacion.precio}`;
        selectHabitacion.innerHTML += `<option value="${habitacion.numero}">${texto}</option>`;
    }

    for (let reserva of reservas) {
        selectReservaPago.innerHTML += `<option value="${reserva.codigo}">${reserva.codigo} - ${reserva.huesped} - S/ ${reserva.total}</option>`;
    }
}

function filaVacia(columnas, texto) {
    return `<tr><td class="texto-vacio" colspan="${columnas}">${texto}</td></tr>`;
}

function mostrarDatos() {
    let tablaHabitaciones = document.getElementById("tablaHabitaciones");
    let tablaHuespedes = document.getElementById("tablaHuespedes");
    let tablaReservas = document.getElementById("tablaReservas");
    let tablaPagos = document.getElementById("tablaPagos");
    let tablaReporteReservas = document.getElementById("tablaReporteReservas");
    let tablaUltimasReservas = document.getElementById("tablaUltimasReservas");

    tablaHabitaciones.innerHTML = "";
    tablaHuespedes.innerHTML = "";
    tablaReservas.innerHTML = "";
    tablaPagos.innerHTML = "";
    tablaReporteReservas.innerHTML = "";
    tablaUltimasReservas.innerHTML = "";

    if (habitaciones.length === 0) {
        tablaHabitaciones.innerHTML = filaVacia(8, "No hay habitaciones registradas.");
    }

    for (let h of habitaciones) {
        tablaHabitaciones.innerHTML += `
            <tr>
                <td>${h.numero}</td>
                <td>${h.tipo}</td>
                <td>${h.piso}</td>
                <td>${h.capacidad}</td>
                <td>S/ ${h.precio}</td>
                <td>${crearBadge(h.estado)}</td>
                <td>${h.descripcion}</td>
                <td><button class="boton-eliminar" onclick="eliminarHabitacion('${h.numero}')">Eliminar</button></td>
            </tr>
        `;
    }

    if (huespedes.length === 0) {
        tablaHuespedes.innerHTML = filaVacia(6, "No hay huéspedes registrados.");
    }

    for (let h of huespedes) {
        tablaHuespedes.innerHTML += `
            <tr>
                <td>${h.dni}</td>
                <td>${h.nombre}</td>
                <td>${h.telefono}</td>
                <td>${h.correo}</td>
                <td>${h.direccion}</td>
                <td><button class="boton-eliminar" onclick="eliminarHuesped('${h.dni}')">Eliminar</button></td>
            </tr>
        `;
    }

    if (reservas.length === 0) {
        tablaReservas.innerHTML = filaVacia(9, "No hay reservas registradas.");
        tablaReporteReservas.innerHTML = filaVacia(6, "No hay reservas para mostrar.");
        tablaUltimasReservas.innerHTML = filaVacia(5, "Aún no hay reservas registradas.");
    }

    for (let r of reservas) {
        tablaReservas.innerHTML += `
            <tr>
                <td>${r.codigo}</td>
                <td>${r.huesped}</td>
                <td>${r.habitacion}</td>
                <td>${r.entrada}</td>
                <td>${r.salida}</td>
                <td>${r.noches}</td>
                <td>S/ ${r.total}</td>
                <td>${crearBadge(r.estado)}</td>
                <td><button class="boton-eliminar" onclick="eliminarReserva('${r.codigo}')">Eliminar</button></td>
            </tr>
        `;

        tablaReporteReservas.innerHTML += `
            <tr>
                <td>${r.codigo}</td>
                <td>${r.huesped}</td>
                <td>${r.habitacion}</td>
                <td>${r.noches}</td>
                <td>S/ ${r.total}</td>
                <td>${crearBadge(r.estado)}</td>
            </tr>
        `;
    }

    for (let r of reservas.slice(-5).reverse()) {
        tablaUltimasReservas.innerHTML += `
            <tr>
                <td>${r.codigo}</td>
                <td>${r.huesped}</td>
                <td>${r.habitacion}</td>
                <td>S/ ${r.total}</td>
                <td>${crearBadge(r.estado)}</td>
            </tr>
        `;
    }

    if (pagos.length === 0) {
        tablaPagos.innerHTML = filaVacia(7, "No hay pagos registrados.");
    }

    for (let p of pagos) {
        tablaPagos.innerHTML += `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.reserva}</td>
                <td>S/ ${p.monto}</td>
                <td>${p.metodo}</td>
                <td>${p.fecha}</td>
                <td>${p.observacion}</td>
                <td><button class="boton-eliminar" onclick="eliminarPago('${p.codigo}')">Eliminar</button></td>
            </tr>
        `;
    }

    let disponibles = contarPorEstado("Disponible");
    let ocupadas = contarPorEstado("Ocupada");
    let mantenimiento = contarPorEstado("Mantenimiento");
    let ingresos = calcularIngresos();

    document.getElementById("totalHabitaciones").textContent = habitaciones.length;
    document.getElementById("totalHuespedes").textContent = huespedes.length;
    document.getElementById("totalReservas").textContent = reservas.length;
    document.getElementById("resumenDisponibles").textContent = `Disponibles: ${disponibles}`;
    document.getElementById("resumenOcupadas").textContent = `Ocupadas: ${ocupadas}`;
    document.getElementById("resumenMantenimiento").textContent = `Mantenimiento: ${mantenimiento}`;
    document.getElementById("ingresosInicio").textContent = `S/ ${ingresos}`;
    document.getElementById("reporteDisponibles").textContent = disponibles;
    document.getElementById("reporteOcupadas").textContent = ocupadas;
    document.getElementById("reporteMantenimiento").textContent = mantenimiento;
    document.getElementById("reporteIngresos").textContent = `S/ ${ingresos}`;

    actualizarSelects();
    guardarDatos();
}

function eliminarHabitacion(numero) {
    habitaciones = habitaciones.filter((habitacion) => habitacion.numero !== numero);
    reservas = reservas.filter((reserva) => reserva.habitacion !== numero);
    pagos = pagos.filter((pago) => reservas.some((reserva) => pago.reserva === reserva.codigo));
    mostrarDatos();
}

function eliminarHuesped(dni) {
    let huesped = huespedes.find((item) => item.dni === dni);
    huespedes = huespedes.filter((item) => item.dni !== dni);

    if (huesped) {
        reservas = reservas.filter((reserva) => reserva.huesped !== huesped.nombre);
        pagos = pagos.filter((pago) => reservas.some((reserva) => pago.reserva === reserva.codigo));
    }

    mostrarDatos();
}

function eliminarReserva(codigo) {
    let reserva = reservas.find((item) => item.codigo === codigo);
    reservas = reservas.filter((item) => item.codigo !== codigo);
    pagos = pagos.filter((pago) => pago.reserva !== codigo);

    if (reserva) {
        let habitacion = habitaciones.find((item) => item.numero === reserva.habitacion);
        if (habitacion) {
            habitacion.estado = "Disponible";
        }
    }

    mostrarDatos();
}

function eliminarPago(codigo) {
    pagos = pagos.filter((pago) => pago.codigo !== codigo);
    mostrarDatos();
}

document.querySelectorAll(".nav").forEach((boton) => {
    boton.addEventListener("click", () => {
        cambiarVista(boton.dataset.vista);
    });
});

document.querySelectorAll("[data-ir]").forEach((boton) => {
    boton.addEventListener("click", () => {
        cambiarVista(boton.dataset.ir);
    });
});

document.getElementById("formHabitacion").addEventListener("submit", (evento) => {
    evento.preventDefault();

    let numero = document.getElementById("numeroHabitacion").value.trim();

    if (habitaciones.some((habitacion) => habitacion.numero === numero)) {
        alert("Ya existe una habitación con ese número.");
        return;
    }

    habitaciones.push({
        numero: numero,
        tipo: document.getElementById("tipoHabitacion").value,
        piso: document.getElementById("pisoHabitacion").value,
        capacidad: document.getElementById("capacidadHabitacion").value,
        precio: Number(document.getElementById("precioHabitacion").value),
        estado: document.getElementById("estadoHabitacion").value,
        descripcion: document.getElementById("descripcionHabitacion").value,
    });

    evento.target.reset();
    mostrarDatos();
});

document.getElementById("formHuesped").addEventListener("submit", (evento) => {
    evento.preventDefault();

    let dni = document.getElementById("dniHuesped").value.trim();

    if (huespedes.some((huesped) => huesped.dni === dni)) {
        alert("Ya existe un huésped con ese DNI.");
        return;
    }

    huespedes.push({
        dni: dni,
        nombre: document.getElementById("nombreHuesped").value,
        telefono: document.getElementById("telefonoHuesped").value,
        correo: document.getElementById("correoHuesped").value,
        direccion: document.getElementById("direccionHuesped").value,
    });

    evento.target.reset();
    mostrarDatos();
});

document.getElementById("formReserva").addEventListener("submit", (evento) => {
    evento.preventDefault();

    let huesped = document.getElementById("huespedReserva").value;
    let habitacion = document.getElementById("habitacionReserva").value;
    let entrada = document.getElementById("entradaReserva").value;
    let salida = document.getElementById("salidaReserva").value;
    let noches = calcularNoches(entrada, salida);

    if (noches === 0) {
        mostrarMensaje("La fecha de salida debe ser mayor que la fecha de entrada.", "error");
        return;
    }

    if (habitacionDisponible(habitacion, entrada, salida)) {
        let habitacionEncontrada = habitaciones.find((h) => h.numero === habitacion);
        let total = noches * Number(habitacionEncontrada.precio);

        reservas.push({
            codigo: "R" + String(reservas.length + 1).padStart(3, "0"),
            huesped: huesped,
            habitacion: habitacion,
            entrada: entrada,
            salida: salida,
            noches: noches,
            total: total,
            estado: "Activa",
        });

        habitacionEncontrada.estado = "Ocupada";
        mostrarMensaje("Reserva registrada correctamente.");
    } else {
        mostrarMensaje("La habitación no está disponible en esas fechas.", "error");
    }

    evento.target.reset();
    mostrarDatos();
});

document.getElementById("reservaPago").addEventListener("change", () => {
    let codigo = document.getElementById("reservaPago").value;
    let reserva = reservas.find((item) => item.codigo === codigo);

    if (reserva) {
        document.getElementById("montoPago").value = reserva.total;
    }
});

document.getElementById("formPago").addEventListener("submit", (evento) => {
    evento.preventDefault();

    pagos.push({
        codigo: "P" + String(pagos.length + 1).padStart(3, "0"),
        reserva: document.getElementById("reservaPago").value,
        monto: Number(document.getElementById("montoPago").value),
        metodo: document.getElementById("metodoPago").value,
        fecha: document.getElementById("fechaPago").value,
        observacion: document.getElementById("observacionPago").value,
    });

    evento.target.reset();
    mostrarDatos();
});

mostrarDatos();
