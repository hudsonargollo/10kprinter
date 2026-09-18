# Sistema de Ventas con IA de ClubeMKT

## Principio
La IA se encarga de la investigación, preparación, documentación y seguimiento repetible. Las personas mantienen el criterio, la empatía, la presentación, el manejo de objeciones y la relación.

## Flujo de cinco fases

1. Prospectar
   - Buscar por perfil de cliente ideal, nicho, geografía y señales de compra.
   - Enriquecer los datos del negocio y de la persona responsable.
   - Eliminar duplicados antes del contacto.
   - Validación humana rápida antes de activar el alcance.

2. Calificar
   - Preguntar por problema, urgencia, proceso actual, tamaño del equipo, inversión, resultado deseado y autoridad de decisión.
   - Guardar respuestas y puntuación en el registro del lead.
   - Solo los leads calificados o pendientes de revisión pasan a una reunión.

3. Presentar
   - Combinar CRM, auditoría web, respuestas de calificación, transcripción y objeciones.
   - Generar una propuesta y un guion personalizados.
   - Programar una llamada para revisar la propuesta; no depender de enviar un archivo sin conversación.

4. Manejar objeciones
   - Guardar transcripciones y revisiones de objeciones.
   - Generar preguntas y guiones para practicar.
   - La IA entrena; la persona responde la objeción real.

5. Inscribir y entregar
   - Marcar la venta con importe y próxima acción.
   - Iniciar onboarding de inmediato.
   - Crear una primera victoria rápida.
   - Registrar la victoria y el permiso para compartirla.

## Rutas nuevas

- `POST /api/leads/:id/qualification`
- `POST /api/leads/:id/artifacts`
- `PATCH /api/leads/:id/next-action`
- `PATCH /api/leads/:id/onboarding`

Los estados técnicos permanecen en inglés para que las integraciones sean estables; las etiquetas de la interfaz se traducen al español, portugués e inglés.
