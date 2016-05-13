// Schéma de Traitre-Lame
var DATABASE_SCHEMA = {
  "type": "object",
  "title": "Comment",
  "properties": {
    "nickname": {
      "title": "Surnom du joueur",
      "type": "string"
    },
    "name": {
      "title": "Prénom et Nom du joueur",
      "type": "string"
    },
    "email": {
      "title": "Émail",
      "type": "string",
      "pattern": "^\\S+@\\S+$",
      "description": "Email will be used for evil."
    },
    "comment": {
      "title": "Comment",
      "type": "string"
    }
  },
  "required": ["name", "email", "comment"]
};
