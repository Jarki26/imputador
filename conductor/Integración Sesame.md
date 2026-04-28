Integración con Sesame HR, una plataforma de registro de fichajes. De esta plataforma se pueden obtener los datos sobre los tiempos trabajados y de descanso de un trabajador, pero sin el contexto de las tareas realizadas, solo los fichajes. Se quiere integrar la creación automática de los descansos consultando los datos de la plataforma. Se ha hecho un análisis previo y estas son las llamadas al API necesarias para obtener los datos.

### Login

Se realiza el login con el `user` y `password` del usuario. La mejor forma de gestionarlo es poder establecerlo desde los ajustes de la aplicación y que se almacenen en el navegador, protegiendo la contraseña de lecturas externas si es posible.

- **URL**: POST https://back-eu4.sesametime.com/api/v3/security/login
- **Body**:

```json
{
    "email": {{user}},
    "password": {{password}}
}
```

- **Respuesta**:

```json
{
    "data": {{token}},
    "meta": {
        "currentPage": 1,
        "lastPage": 1,
        "total": 1,
        "perPage": 1
    }
}
```

### Obtener Usuario

Con el token ya se puede llamar a la consulta del usuario para obtener su `id` que será necesario para futuras llamadas. Esta llamada debe realizarse si no se ha obtenido previamente el id del usuario, si ya existe no hace falta realizarla ya que no debería cambiar. Hay que tener en cuenta que el usuario necesita un botón para cerrar sesión de Sesame en el mismo apartado de ajustes que su lógica será eliminar las credenciales almacenadas del anterior paso y el id del usuario.

- **URL**: GET https://back-eu4.sesametime.com/api/v3/security/me
- **Cabecera**:
  - `Authorization: {{token}}`
- **Respuesta**:

```json
{
    "data": [
        {
            "id": {{id}},
            ...
        }
    ],
    "meta": {
        "currentPage": 1,
        "lastPage": 1,
        "total": 1,
        "perPage": 1
    }
}
```

### Consultar fichajes

La consulta de fichajes se realiza por rango de días. Para el contexto de la app se hará de la semana mostrada en el modo semanal.

- **URL**: https://back-eu4.sesametime.com/api/v3/employees/{{id}}/checks?from={{week_start}}&to={{week_end}}&includeOut=true
- **Cabecera**:
  - `Authorization: {{token}}`
- **Respuesta**:

```json
{
  "data": [
    {
      "checkIn": {
        "date": "2026-04-17T07:54:35+02:00"
      },
      "checkOut": {
        "date": "2026-04-17T10:02:49+02:00"
      },
      "checkType": "work",
      "isRemunerated": true
    }
  ],
  "meta": {
    "currentPage": 1,
    "lastPage": 1,
    "total": 38,
    "perPage": 2000
  }
}
```

En este ejemplo reducido de respuesta en `data` hay una lista de registros de fichaje de trabajo en los que `checkIn.date` hace referencia a la fecha y hora inicio y `checkOut.date` a la fecha y hora fin. Sin embargo para aplicar el registro de descansos se hará creando los huecos que no existen entre esta lista de fichajes siguiendo el formato descrito y siempre creando solo los descansos dentro del tiempo comprendido entre el primer registro de trabajo del día y el último.

## Política de actualización

Los descansos generados por la integración siempre tendrán el siguiente formato:

- Título: Descanso
- Proyecto: sesame
- Tipo: Rest

De forma que cuando se vayan a insertar descansos debido a que se ha hecho la consulta se plantea el siguiente flujo de comprobaciones:

1.  Si existe una tarea igual en la que coincide la hora de inicio y fin con una existente y del mismo formato descrito, no se realiza ninguna inserción porque ya existe.
2.  Si existe una tarea igual con el mismo formato pero genera conflicto con la nueva tarea que se va a insertar, se elimina por completo la tarea detectada (que tenga el formato descrito) y se inserta la nueva.
3.  Si hay conflicto con otro tipo de tareas se permite la inserción para que sea el usuario el que lo resuelva.

## Códigos de error

Extraído directamente de la documentación del servicio de Sesame estos son los posibles códigos de errores obtenibles al realizar consultas. Se debe contemplar estos casos para mostrar mensajes informativos al usuario si aparece alguno de estos casos.

| Error Code            | HTTP Status | Description                             |
| --------------------- | ----------- | --------------------------------------- |
| `validation_error`    | 422         | Request data failed validation          |
| `not_found`           | 404         | Requested resource doesn’t exist        |
| `unauthorized`        | 401         | Invalid or missing authentication token |
| `forbidden`           | 403         | Token lacks required permissions        |
| `conflict`            | 409         | Resource conflict (duplicate, etc.)     |
| `rate_limit_exceeded` | 429         | Too many requests                       |
| `internal_error`      | 500         | Unexpected server error                 |
| `service_unavailable` | 503         | Service temporarily unavailable         |
