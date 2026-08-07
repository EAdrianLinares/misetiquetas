---
mode: ask
description: "Rediseñar la configuración de impresión separando etiqueta y papel con perfiles."
---

# Rediseño de la configuración de impresión

Quiero mejorar la experiencia de usuario del módulo de impresión.

Actualmente existen los siguientes controles:

- Plantilla
- Tipo de código
- Copias
- Papel
- Margen
- Separación

Quiero reorganizar completamente esta sección para separar la configuración de la etiqueta de la configuración del papel.

---

## Objetivo

La aplicación debe parecer un software profesional de impresión de etiquetas.

El usuario primero debe definir qué desea imprimir y luego dónde desea imprimirlo.

---

## Nuevo orden

### Configuración de la etiqueta

1. Plantilla

Selecciona la plantilla de etiqueta.

La plantilla define:

- ancho
- alto
- diseño

Nunca define el papel.

---

2. Tipo de código

Opciones:

- Código de barras
- Código QR

---

3. Copias

Número de copias por registro.

---

### Configuración de impresión

4. Perfil de papel

Este control reemplaza al selector actual de "Papel".

Debe permitir seleccionar perfiles de impresión.

Ejemplos:

- Continuo 58 mm
- Continuo 80 mm
- Continuo 100 mm
- Continuo 100 mm - 2 columnas
- Continuo 100 mm - 3 columnas
- Carta
- A4
- Personalizado

Cada perfil define internamente:

- ancho del papel
- orientación
- columnas
- márgenes
- separación horizontal
- separación vertical

El usuario no debe configurar estos valores manualmente para perfiles predefinidos.

---

5. Columnas

Mostrar únicamente cuando el perfil sea "Personalizado".

Permitir:

- 1
- 2
- 3
- 4

---

6. Márgenes

Mostrar únicamente cuando el perfil sea "Personalizado".

Valores en mm.

---

7. Separación

Mostrar únicamente cuando el perfil sea "Personalizado".

Horizontal.

Vertical.

---

## Reglas para perfil "Personalizado"

- Columnas permitidas: 1 a 4.
- Márgenes por defecto: 5mm.
- Margen 0mm: solo en papel continuo cuando esté habilitado.
- Separación por defecto: 2mm.

---

## Comportamiento

Al seleccionar un perfil de papel:

La aplicación debe cargar automáticamente:

- columnas
- márgenes
- separación
- orientación

sin modificar el tamaño de la etiqueta.

---

## Motor de impresión

La impresión debe calcular automáticamente:

- filas
- columnas
- páginas
- posición de cada etiqueta

utilizando:

Plantilla + Perfil de papel

Nunca escalar la etiqueta.

---

## Arquitectura

Crear un modelo PaperProfile.

Ejemplo:

interface PaperProfile {

    id: string;

    nombre: string;

    anchoPapel: number;

    altoPapel?: number;

    columnas: number;

    margenSuperior: number;

    margenInferior: number;

    margenIzquierdo: number;

    margenDerecho: number;

    separacionHorizontal: number;

    separacionVertical: number;

    orientacion: 'portrait' | 'landscape';

}

Las plantillas permanecen independientes.

---

## Interfaz

Agrupar visualmente los controles en dos tarjetas:

Configuración de la etiqueta

Configuración de impresión

Los controles deben alinearse correctamente.

Mantener estilo visual actual del proyecto.

No romper la lógica existente de etiquetas; extender lógica de configuración de impresión.

Solo reorganizar la configuración y preparar la arquitectura para soportar múltiples perfiles de papel.

---

## Criterios de aceptación

✓ El usuario primero selecciona la plantilla.

✓ Luego selecciona el tipo de código.

✓ Luego define las copias.

✓ Después selecciona el perfil de papel.

✓ Si el perfil es estándar, las columnas, márgenes y separación se cargan automáticamente.

✓ Si el perfil es "Personalizado", el usuario puede editar estos valores.

✓ La impresión utiliza únicamente la combinación Plantilla + Perfil de papel.

✓ Nunca se modifica el tamaño físico de la etiqueta.