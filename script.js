let apikey = "iwvkEolH9NDAvEANy7mAWVZkR6VKaRgKNxlLZ0As"
let urlbase = "https://api.nasa.gov/planetary/apod"
let resultado = document.getElementById("resultado")
let mensaje = document.getElementById("mensaje")
let botonhoy = document.getElementById("btnHoy")
let botonfecha = document.getElementById("btnFecha")
let botonaleatorias = document.getElementById("btnAleatorias")
let botonrango = document.getElementById("btnRango")
let inputfecha = document.getElementById("fecha")
let inputfechainicio = document.getElementById("fechaInicio")
let inputfechafin = document.getElementById("fechaFin")
let inputcantidad = document.getElementById("cantidad")
let hoy = new Date().toISOString().split("T")[0]
inputfecha.max = hoy
inputfechainicio.max = hoy
inputfechafin.max = hoy
function mostrarmensaje(texto, tipo = "info") {
    mensaje.textContent = texto
    if (tipo === "error") {
        mensaje.style.color = "#c0392b"
    } else {
        mensaje.style.color = "#b36b00"
    }
}
function limpiarmensaje() {
    mensaje.textContent = ""
}
function mostrarcarga() {
    resultado.innerHTML = `<div class="card"><div class="card-content"><h2>Cargando...</h2><p class="date">Consultando la API de NASA</p></div></div>`
}
function creartarjeta(item) {
    let media
    if (item.media_type === "image") {
        media = `<img src="${item.url}" alt="${item.title}">`
    } else {
        media = `<iframe src="${item.url}" allowfullscreen title="${item.title}"></iframe>`
    }
    return `<article class="card">${media}<div class="card-content"><h2>${item.title}</h2><div class="date">${item.date}</div><p>${item.explanation}</p></div></article>`
}
function renderizardatos(datos) {
    let lista = Array.isArray(datos) ? datos : [datos]
    resultado.innerHTML = lista.map(creartarjeta).join("")
}
async function consultarapod(params = {}) {
    let url = new URL(urlbase)
    url.searchParams.set("api_key", apikey)
    Object.entries(params).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== "") {
            url.searchParams.set(clave, valor)
        }
    })
    mostrarcarga()
    let respuesta = await fetch(url.toString())
    let datos = await respuesta.json()
    if (!respuesta.ok) {
        throw new Error(datos.msg || "Error al consultar la API.")
    }
    return datos
}
async function obtenerfotodeldia() {
    try {
        limpiarmensaje()
        let datos = await consultarapod()
        renderizardatos(datos)
        mostrarmensaje("Mostrando la foto del día.")
    } catch (error) {
        resultado.innerHTML = ""
        mostrarmensaje(error.message, "error")
    }
}
async function obtenerporfecha() {
    let fecha = inputfecha.value
    if (!fecha) {
        mostrarmensaje("Seleccioná una fecha.", "error")
        return
    }
    if (fecha > hoy) {
        mostrarmensaje("La fecha no puede ser futura.", "error")
        return
    }
    try {
        limpiarmensaje()
        let datos = await consultarapod({ date: fecha })
        renderizardatos(datos)
        mostrarmensaje(`Mostrando la foto del ${fecha}.`)
    } catch (error) {
        resultado.innerHTML = ""
        mostrarmensaje(error.message, "error")
    }
}
async function obteneraleatorias() {
    let cantidad = Number(inputcantidad.value)
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 10) {
        mostrarmensaje("La cantidad debe estar entre 1 y 10.", "error")
        return
    }
    try {
        limpiarmensaje()
        let datos = await consultarapod({ count: cantidad })
        renderizardatos(datos)
        mostrarmensaje(`Mostrando ${cantidad} foto(s) aleatoria(s).`)
    } catch (error) {
        resultado.innerHTML = ""
        mostrarmensaje(error.message, "error")
    }
}
async function obtenerrango() {
    let inicio = inputfechainicio.value
    let fin = inputfechafin.value
    if (!inicio || !fin) {
        mostrarmensaje("Seleccioná fecha de inicio y fecha de fin.", "error")
        return
    }
    if (inicio > fin) {
        mostrarmensaje("La fecha de inicio no puede ser mayor que la de fin.", "error")
        return
    }
    if (inicio > hoy || fin > hoy) {
        mostrarmensaje("No se permiten fechas futuras.", "error")
        return
    }
    try {
        limpiarmensaje()
        let datos = await consultarapod({ start_date: inicio, end_date: fin })
        renderizardatos(datos)
        mostrarmensaje(`Mostrando fotos entre ${inicio} y ${fin}.`)
    } catch (error) {
        resultado.innerHTML = ""
        mostrarmensaje(error.message, "error")
    }
}
botonhoy.addEventListener("click", obtenerfotodeldia)
botonfecha.addEventListener("click", obtenerporfecha)
botonaleatorias.addEventListener("click", obteneraleatorias)
botonrango.addEventListener("click", obtenerrango)
obtenerfotodeldia()
