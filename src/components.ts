import Exp from 'jsonata'

enum OMNITOOL_DOCUMENT_TYPES {
  WORKFLOW = 'wf',
  USER = 'user',
  USERDOC = 'udoc',
  CHAT = 'chat'
}

const UserDBGet =  {
 schema:
  {
    "tags": ['default'],
    "componentKey": "userdb_get",
    "category": "Storage",
    "operation": {

      "schema": {
        "title": "Get User Value",
        "type": "object",
        "required": ["key"],
        "properties": {
          "key": {
            "title": "Key",
            "type": "string",
            "description": "A Key"
          },
          "jsonata":
          {
            "title": "JSONata",
            "type": "string",
            "description": "A jsonata to run"
          }

        },
      },
      "responseTypes": {
        "200": {
          "schema": {
            "title": "JSON",
            "required": [
            ],
            "type": "object",
            "properties": {
              "key": {
                "title": "Key",
                "type": "string",
                "description": "Key"
              },
              "rev": {
                "title": "Update Token",
                "type": "string",
                "description": "The return Value"
              },
              "json": {
                "title": "JSON",
                "type": "object",
                "description": "The return Value"
              },
              "jsonata":
              {
                "title": "Jsonata Result",
                "type": "object",
                "description": "The result of the jsonata transformation, if specified"
              },
              "text": {
                "title": "text",
                "type": "string",
                "x-type": "text",
                "description": "The return Value"
              }
            },

          },
          "contentType": "application/json"
        },
      },
      "method": "X-CUSTOM",
      "summary": "A standard text input component"
    }
  },

  functions: {
  _exec: async (payload: any, ctx:any) => {
    let key = payload.key;
    let json: { value: {}, _id: string, _rev: string }
    let db = ctx.app.services.get('db')
    if (key != null) {
      key = key.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]+/g, "");
    }
    else {
      throw new Error("Key Missing")
    }


    const effectiveKey = `${ctx.userId}:${key}`

    //@ts-ignore
    json = await db.getDocumentById(OMNITOOL_DOCUMENT_TYPES.USERDOC, effectiveKey)

    if (json != null && json.value != null) {

      //@ts-ignore
      delete json._id

      //@ts-ignore
      const ret = { key: key, rev: json._rev, json: json.value, text: "", jsonata: undefined }
      //@ts-ignore
      delete json._rev


      if (payload.jsonata != null && typeof payload.jsonata === 'string' && payload.jsonata.trim().length > 0) {

        const expression = Exp(payload.jsonata)

        let tmp = await expression.evaluate(ret.json)
        ret.jsonata = tmp
        ret.text = tmp?.toString?.()
      }
      else {
        ret.text = ret.json?.toString?.()
      }
      return ret
    }
    else {
      throw new Error("Invalid database object (null)")
    }

    }
    }
  }

const UserDBDel = {
  schema: {
    "tags": ['default'],
    "componentKey": "userdb_del",

    "category": "Storage",
    "operation": {

      "schema": {
        "title": "Delete User Value",
        "type": "object",
        "required": ["key", "_rev"],
        "properties": {
          "key": {
            "title": "Key",
            "type": "string",
            "description": "A key"
          },
          "_rev": {
            "title": "Update Token",
            "type": "string",
            "description": "A rev"
          },

        },
      },
      "responseTypes": {
        "200": {
          "schema": {
            "title": "JSON",
            "required": [
            ],
            "type": "object",
            "properties": {
              "success": {
                "title": "success",
                "type": "boolean",
              },
            },

          },
          "contentType": "application/json"
        },
        "method": "X-CUSTOM",
        "summary": "A standard text input component"
      }
    }
  },
  functions:
  {
  _exec: async (payload: any, ctx: any) => {
    let key = payload.key;
    let json: { success: boolean }
    let db = ctx.app.services.get('db')

    if (key != null && payload._rev != null) {
      key = key.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]+/g, "");
    }
    else {
      throw new Error("Key or Rev Missing")
    }

    const effectiveKey = `${ctx.userId}:${key}`

    //@ts-ignore
    json = await db.deleteDocumentById(OMNITOOL_DOCUMENT_TYPES.USERDOC, effectiveKey, payload._rev)

    if (json != null) {
      let ret = { "success": true }
      return ret
    }
    else {
      throw new Error("Invalid database object (null)")
    }

  }
  }
}


const UserDBPut = {
  schema:
  {
    "tags": ['default'],
    "componentKey": "userdb_put",

    "category": "Storage",
    "operation": {

      "schema": {
        "title": "Put User Value",
        "type": "object",
        "required": ['key', 'value'],
        "properties": {
          "key": {
            "title": "Key",
            "type": "string",
            "description": "A Key"
          },
          "rev":
          {
            "title": "Update Token",
            "type": "string",
            "description": "An Update Token to update an existing value"
          },
          "value":
          {
            "title": "JSON",
            "type": "object",
            "description": "An object to save"
          }
        },
      },
      "responseTypes": {
        "200": {
          "schema": {
            "title": "JSON",
            "required": [
            ],
            "type": "object",
            "properties": {
              "success": {
                "title": "Success",
                "type": "boolean",
                "description": "Success of Failure"
              },
              "key": {
                "title": "Key",
                "type": "string",
                "description": "Key"
              },
              "rev":
              {
                "title": "Update Token",
                "type": "string",
                "description": "The new Update Token"
              },
              "json":
              {
                "title": "JSON",
                "type": "object",
                "description": "The result object"
              }
            },
          },
          "contentType": "application/json"
        },
      },
      "method": "X-CUSTOM",
      "summary": "A standard text input component"
    }
  },

  functions: {
  _exec: async (payload: any, ctx: any) => {
    let key = payload.key;
    const rev = payload.rev;

    if (key != null) {
      key = key.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]+/g, "");
    }
    else {
      throw new Error("Key Missing")
    }

    let db = ctx.app.services.get('db') as any

    const effectiveKey = `${ctx.userId}:${key}`

    let json = await db.putDocumentById(OMNITOOL_DOCUMENT_TYPES.USERDOC, effectiveKey, {value: payload.value}, rev || undefined)

    if (json != null) {
      //@ts-ignore
      delete json._id

      //@ts-ignore
      const ret = { rev: json._rev, json: json, key: key }
      //@ts-ignore
      delete json._rev
      //@ts-ignore
      ret.success = true

      return ret
    }
    else {
      throw new Error("Invalid database object (null)")
    }

    }
  }
}



const WorkflowStoragePut =
{
  schema:
  {
    "tags": ['default'],
    "componentKey": "workflowstorage_put",

    "category": "Storage",
    "operation": {

      "required": ['key', 'value'],
      "schema": {
        "title": "Workflow Storage Put Value",
        "type": "object",
        "properties": {
          "key": {
            "title": "Key",
            "type": "string",
            "description": "A Key"
          },
          "value":
          {
            "title": "JSON",
            "type": "object",
            "description": "An object to save"
          },
          "rev":
          {
            "title": "Update Token",
            "type": "string",
            "description": "An Update Token to update an existing value"
          }
        },
      },
      "responseTypes": {
        "200": {
          "schema": {
            "title": "JSON",
            "required": [
            ],
            "type": "object",
            "properties": {
              "success": {
                "title": "Success",
                "type": "boolean",
                "description": "Success of Failure"
              },
              "key": {
                "title": "Key",
                "type": "string",
                "description": "Key"
              },
              "json":
              {
                "title": "JSON",
                "type": "object",
                "description": "The result object"
              },
              "rev":
              {
                "title": "Update Token",
                "type": "string",
                "description": "The new Update Token"
              }
            },
          },
          "contentType": "application/json"
        },
      },
      "method": "X-CUSTOM",
      "summary": "A standard text input component"
    }
  },

  functions:
  {
  _exec: async (payload: any, ctx: any) => {
    let key = payload.key;
    const rev = payload.rev;

    if (key != null) {
      key = key.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]+/g, "");
    }
    else {
      throw new Error("Key Missing")
    }

    let db = ctx.app.services.get('db') as any

    const effectiveKey = `${ctx.workflowId}:${ctx.userId}:${key}`

    let json = await db.putDocumentById(OMNITOOL_DOCUMENT_TYPES.USERDOC, effectiveKey, {value: payload.value}, rev || undefined)

    if (json != null) {
      //@ts-ignore
      delete json._id

      //@ts-ignore
      const ret = { rev: json._rev, json, key: key }
      //@ts-ignore
      delete json._rev
      //@ts-ignore
      ret.success = true

      return ret
    }
    else {
      throw new Error("Invalid database object (null)")
    }

    }
  }
}


const WorkflowStorageGet = {
  schema:
  {
    "tags": ['default'],
    "componentKey": "workflowstorage_get",

    "category": "Storage",
    "operation": {

      "schema": {
        "title": "Get Workflow Storage Value",
        "type": "object",
        "required": ["key"],
        "properties": {
          "key": {
            "title": "Key",
            "type": "string",
            "description": "A Key"
          },
          "jsonata":
          {
            "title": "JSONata",
            "type": "string",
            "description": "A jsonata to run"
          }

        },
      },
      "responseTypes": {
        "200": {
          "schema": {
            "title": "JSON",
            "required": [
            ],
            "type": "object",
            "properties": {
              "json": {
                "title": "JSON",
                "type": "object",
                "description": "The return Value"
              },
              "jsonata":
              {
                "title": "Jsonata Result",
                "type": "object",
                "description": "The result of the jsonata transformation, if specified"
              },
              "text": {
                "title": "text",
                "type": "string",
                "x-type": "text",
                "description": "The return Value"
              },
              "rev": {
                "title": "Update Token",
                "type": "string",
                "description": "The return Value"
              }
            },

          },
          "contentType": "application/json"
        },
      },
      "method": "X-CUSTOM",
      "summary": "A standard text input component"
    }
  },
  functions:
  {
  _exec: async (payload: any, ctx: any) => {
    let key = payload.key;
    let json: { value: {}, _id: string, _rev: string }
    let db = ctx.app.services.get('db')
    if (key != null) {
      key = key.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]+/g, "");
    }
    else {
      throw new Error("Key Missing")
    }


    const effectiveKey = `${ctx.workflowId}:${ctx.userId}:${key}`

    //@ts-ignore
    json = await db.getDocumentById(OMNITOOL_DOCUMENT_TYPES.USERDOC, effectiveKey)

    if (json != null && json.value != null) {

      //@ts-ignore
      delete json._id

      //@ts-ignore
      const ret = { rev: json._rev, json: json.value, text: "", jsonata: undefined }
      //@ts-ignore
      delete json._rev

      if (payload.jsonata != null && typeof payload.jsonata === 'string' && payload.jsonata.trim().length > 0) {

        const expression = Exp(payload.jsonata)

        let tmp = await expression.evaluate(ret.json)
        ret.jsonata = tmp
        ret.text = tmp?.toString?.()
      }
      else {
        ret.text = ret.json?.toString?.()
      }
      return ret
    }
    else {
      throw new Error("Invalid database object (null)")
    }

  }
  }
}


let components = [UserDBGet, UserDBPut, UserDBDel, WorkflowStorageGet, WorkflowStoragePut]


export default (FactoryFn: any) =>
{
  return components.map((c) => FactoryFn(c.schema, c.functions))
}
