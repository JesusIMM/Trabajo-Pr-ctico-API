let API_KEY = "iwvkEolH9NDAvEANy7mAWVZkR6VKaRgKNxlLZ0As"
let URL_BASE = "https://api.nasa.gov/planetary/apod"

let resultado = document.getElementById("resultado")
let mensaje = document.getElementById("mensaje")

let btnHoy = document.getElementById("btnHoy")
let btnFecha = document.getElementById("btnFecha")
let btnAleatorias = document.getElementById("btnAleatorias")
let btnRango = document.getElementById("btnRango")

let fechaInput = document.getElementById("fecha")
let fechaInicioInput = document.getElementById("fechaInicio")
let fechaFinInput = document.getElementById("fechaFin")
let cantidadInput = document.getElementById("cantidad")

let hoy = new Date().toISOString().split("T")[0]
fechaInput.max = hoy
fechaInicioInput.max = hoy
fechaFinInput.max = hoy

function mostrarMensaje(texto, tipo = "info") {
    mensaje.textContent = texto

    if (tipo === "error") {
        mensaje.style.color = "#c0392b"
    } else {
        mensaje.style.color = "#b36b00"
    }
}

function limpiarMensaje() {
    mensaje.textContent = ""
}

function mostrarCarga() {
    resultado.innerHTML = `
        <div class="card">
            <div class="card-content">
                <h2>Cargando...</h2>
                <p class="date">Consultando la API de NASA</p>
            </div>
        </div>
    `
}

function crearTarjeta(item) {
    let media

    if (item.media_type === "image") {
        media = `<img src="${item.url}" alt="${item.title}">`
    } else {
        media = `<iframe src="${item.url}" allowfullscreen title="${item.title}"></iframe>`
    }

    return `
        <article class="card">
            ${media}
            <div class="card-content">
                <h2>${item.title}</h2>
                <div class="date">${item.date}</div>
                <p>${item.explanation}</p>
            </div>
        </article>
    `
}

function renderizarDatos(datos) {
    let lista = Array.isArray(datos) ? datos : [datos]
    resultado.innerHTML = lista.map(crearTarjeta).join("")
}

async function consultarAPOD(params = {}) {
    let url = new URL(URL_BASE)
    url.searchParams.set("api_key", API_KEY)

    Object.entries(params).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== "") {
            url.searchParams.set(clave, valor)
        }
    })

    mostrarCarga()

    let respuesta = await fetch(url.toString())
    let datos = await respuesta.json()

    if (!respuesta.ok) {
        throw new Error(datos.msg || "Error al consultar la API.")
    }

    return datos
}

async function obtenerFotoDelDia() {
    try {
        limpiarMensaje()
        let datos = await consultarAPOD()
        renderizarDatos(datos)
        mostrarMensaje("Mostrando la foto del día.")
    } catch (error) {
        resultado.innerHTML = ""
        mostrarMensaje(error.message, "error")
    }
}

async function obtenerPorFecha() {
    let fecha = fechaInput.value

    if (!fecha) {
        mostrarMensaje("Seleccioná una fecha.", "error")
        return
    }

    if (fecha > hoy) {
        mostrarMensaje("La fecha no puede ser futura.", "error")
        return
    }

    try {
        limpiarMensaje()
        let datos = await consultarAPOD({ date: fecha })
        renderizarDatos(datos)
        mostrarMensaje(`Mostrando la foto del ${fecha}.`)
    } catch (error) {
        resultado.innerHTML = ""
        mostrarMensaje(error.message, "error")
    }
}

async function obtenerAleatorias() {
    let cantidad = Number(cantidadInput.value)

    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 10) {
        mostrarMensaje("La cantidad debe estar entre 1 y 10.", "error")
        return
    }

    try {
        limpiarMensaje()
        let datos = await consultarAPOD({ count: cantidad })
        renderizarDatos(datos)
        mostrarMensaje(`Mostrando ${cantidad} foto(s) aleatoria(s).`)
    } catch (error) {
        resultado.innerHTML = ""
        mostrarMensaje(error.message, "error")
    }
}

async function obtenerRango() {
    let inicio = fechaInicioInput.value
    let fin = fechaFinInput.value

    if (!inicio || !fin) {
        mostrarMensaje("Seleccioná fecha de inicio y fecha de fin.", "error")
        return
    }

    if (inicio > fin) {
        mostrarMensaje("La fecha de inicio no puede ser mayor que la de fin.", "error")
        return
    }

    if (inicio > hoy || fin > hoy) {
        mostrarMensaje("No se permiten fechas futuras.", "error")
        return
    }

    try {
        limpiarMensaje()
        let datos = await consultarAPOD({
            start_date: inicio,
            end_date: fin
        })

        renderizarDatos(datos)
        mostrarMensaje(`Mostrando fotos entre ${inicio} y ${fin}.`)
    } catch (error) {
        resultado.innerHTML = ""
        mostrarMensaje(error.message, "error")
    }
}

btnHoy.addEventListener("click", obtenerFotoDelDia)
btnFecha.addEventListener("click", obtenerPorFecha)
btnAleatorias.addEventListener("click", obtenerAleatorias)
btnRango.addEventListener("click", obtenerRango)

obtenerFotoDelDia()