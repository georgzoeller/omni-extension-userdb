// components.ts
import Exp from "jsonata";
var UserDBGet = {
  schema: {
    "namespace": "omnitool",
    "tags": ["default"],
    "componentKey": "userdb_get",
    "apiKey": "omni.userdb_get",
    "category": "Storage",
    "operation": {
      "operationId": "userdb_get",
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
          "jsonata": {
            "title": "JSONata",
            "type": "string",
            "description": "A jsonata to run"
          }
        }
      },
      "responseTypes": {
        "200": {
          "schema": {
            "title": "JSON",
            "required": [],
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
              "jsonata": {
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
            }
          },
          "contentType": "application/json"
        }
      },
      "method": "X-CUSTOM",
      "summary": "A standard text input component"
    }
  },
  functions: {
    _exec: async (payload, ctx) => {
      let key = payload.key;
      let json;
      let db = ctx.app.services.get("db");
      if (key != null) {
        key = key.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]+/g, "");
      } else {
        throw new Error("Key Missing");
      }
      const effectiveKey = `${ctx.userId}:${key}`;
      json = await db.getDocumentById("udoc" /* USERDOC */, effectiveKey);
      if (json != null && json.value != null) {
        delete json._id;
        const ret = { key, rev: json._rev, json: json.value, text: "", jsonata: void 0 };
        delete json._rev;
        if (payload.jsonata != null) {
          const expression = Exp(payload.jsonata);
          let tmp = await expression.evaluate(ret.json);
          ret.jsonata = tmp;
          ret.text = tmp?.toString?.();
        } else {
          ret.text = ret.json?.toString?.();
        }
        return ret;
      } else {
        throw new Error("Invalid database object (null)");
      }
    }
  }
};
var UserDBDel = {
  schema: {
    "namespace": "omnitool",
    "tags": ["default"],
    "componentKey": "userdb_del",
    "apiKey": "omni.userdb_del",
    "category": "Storage",
    "operation": {
      "operationId": "userdb_del",
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
          }
        }
      },
      "responseTypes": {
        "200": {
          "schema": {
            "title": "JSON",
            "required": [],
            "type": "object",
            "properties": {
              "success": {
                "title": "success",
                "type": "boolean"
              }
            }
          },
          "contentType": "application/json"
        },
        "method": "X-CUSTOM",
        "summary": "A standard text input component"
      }
    }
  },
  functions: {
    _exec: async (payload, ctx) => {
      let key = payload.key;
      let json;
      let db = ctx.app.services.get("db");
      if (key != null && payload._rev != null) {
        key = key.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]+/g, "");
      } else {
        throw new Error("Key or Rev Missing");
      }
      const effectiveKey = `${ctx.userId}:${key}`;
      json = await db.deleteDocumentById("udoc" /* USERDOC */, effectiveKey, payload._rev);
      if (json != null) {
        let ret = { "success": true };
        return ret;
      } else {
        throw new Error("Invalid database object (null)");
      }
    }
  }
};
var UserDBPut = {
  schema: {
    "namespace": "omnitool",
    "tags": ["default"],
    "componentKey": "userdb_put",
    "apiKey": "omni.userdb_put",
    "category": "Storage",
    "operation": {
      "operationId": "userdb_put",
      "schema": {
        "title": "Put User Value",
        "type": "object",
        "required": ["key", "value"],
        "properties": {
          "key": {
            "title": "Key",
            "type": "string",
            "description": "A Key"
          },
          "rev": {
            "title": "Update Token",
            "type": "string",
            "description": "An Update Token to update an existing value"
          },
          "value": {
            "title": "JSON",
            "type": "object",
            "description": "An object to save"
          }
        }
      },
      "responseTypes": {
        "200": {
          "schema": {
            "title": "JSON",
            "required": [],
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
              "rev": {
                "title": "Update Token",
                "type": "string",
                "description": "The new Update Token"
              },
              "json": {
                "title": "JSON",
                "type": "object",
                "description": "The result object"
              }
            }
          },
          "contentType": "application/json"
        }
      },
      "method": "X-CUSTOM",
      "summary": "A standard text input component"
    }
  },
  functions: {
    _exec: async (payload, ctx) => {
      let key = payload.key;
      const rev = payload.rev;
      if (key != null) {
        key = key.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]+/g, "");
      } else {
        throw new Error("Key Missing");
      }
      let db = ctx.app.services.get("db");
      const effectiveKey = `${ctx.userId}:${key}`;
      let json = await db.putDocumentById("udoc" /* USERDOC */, effectiveKey, { value: payload.value }, rev || void 0);
      if (json != null) {
        delete json._id;
        const ret = { rev: json._rev, json, key };
        delete json._rev;
        ret.success = true;
        return ret;
      } else {
        throw new Error("Invalid database object (null)");
      }
    }
  }
};
var WorkflowStoragePut = {
  schema: {
    "namespace": "omnitool",
    "tags": ["default"],
    "componentKey": "workflowstorage_put",
    "apiKey": "omni.workflowstorage_put",
    "category": "Storage",
    "operation": {
      "operationId": "workflowstorage_put",
      "required": ["key", "value"],
      "schema": {
        "title": "Workflow Storage Put Value",
        "type": "object",
        "properties": {
          "key": {
            "title": "Key",
            "type": "string",
            "description": "A Key"
          },
          "value": {
            "title": "JSON",
            "type": "object",
            "description": "An object to save"
          },
          "rev": {
            "title": "Update Token",
            "type": "string",
            "description": "An Update Token to update an existing value"
          }
        }
      },
      "responseTypes": {
        "200": {
          "schema": {
            "title": "JSON",
            "required": [],
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
              "json": {
                "title": "JSON",
                "type": "object",
                "description": "The result object"
              },
              "rev": {
                "title": "Update Token",
                "type": "string",
                "description": "The new Update Token"
              }
            }
          },
          "contentType": "application/json"
        }
      },
      "method": "X-CUSTOM",
      "summary": "A standard text input component"
    }
  },
  functions: {
    _exec: async (payload, ctx) => {
      let key = payload.key;
      const rev = payload.rev;
      if (key != null) {
        key = key.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]+/g, "");
      } else {
        throw new Error("Key Missing");
      }
      let db = ctx.app.services.get("db");
      const effectiveKey = `${ctx.workflowId}:${ctx.userId}:${key}`;
      let json = await db.putDocumentById("udoc" /* USERDOC */, effectiveKey, { value: payload.value }, rev || void 0);
      if (json != null) {
        delete json._id;
        const ret = { rev: json._rev, json, key };
        delete json._rev;
        ret.success = true;
        return ret;
      } else {
        throw new Error("Invalid database object (null)");
      }
    }
  }
};
var WorkflowStorageGet = {
  schema: {
    "namespace": "omnitool",
    "tags": ["default"],
    "componentKey": "workflowstorage_get",
    "apiKey": "omni.workflowstorage_get",
    "category": "Storage",
    "operation": {
      "operationId": "workflowstorage_get",
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
          "jsonata": {
            "title": "JSONata",
            "type": "string",
            "description": "A jsonata to run"
          }
        }
      },
      "responseTypes": {
        "200": {
          "schema": {
            "title": "JSON",
            "required": [],
            "type": "object",
            "properties": {
              "json": {
                "title": "JSON",
                "type": "object",
                "description": "The return Value"
              },
              "jsonata": {
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
            }
          },
          "contentType": "application/json"
        }
      },
      "method": "X-CUSTOM",
      "summary": "A standard text input component"
    }
  },
  functions: {
    _exec: async (payload, ctx) => {
      let key = payload.key;
      let json;
      let db = ctx.app.services.get("db");
      if (key != null) {
        key = key.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]+/g, "");
      } else {
        throw new Error("Key Missing");
      }
      const effectiveKey = `${ctx.workflowId}:${ctx.userId}:${key}`;
      json = await db.getDocumentById("udoc" /* USERDOC */, effectiveKey);
      if (json != null && json.value != null) {
        delete json._id;
        const ret = { rev: json._rev, json: json.value, text: "", jsonata: void 0 };
        delete json._rev;
        if (payload.jsonata != null) {
          const expression = Exp(payload.jsonata);
          let tmp = await expression.evaluate(ret.json);
          ret.jsonata = tmp;
          ret.text = tmp?.toString?.();
        } else {
          ret.text = ret.json?.toString?.();
        }
        return ret;
      } else {
        throw new Error("Invalid database object (null)");
      }
    }
  }
};
var components = [UserDBGet, UserDBPut, UserDBDel, WorkflowStorageGet, WorkflowStoragePut];
var components_default = (FactoryFn) => {
  return components.map((c) => FactoryFn(c.schema, c.functions));
};

// extension.ts
var extensionHooks = {};
var extension_default = { hooks: extensionHooks, createComponents: components_default };
export {
  extension_default as default
};
