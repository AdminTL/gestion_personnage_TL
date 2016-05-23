// Schéma de Traitre-Lame
var DATABASE_SCHEMA = {
  type: "object",
  title: "Joueur",
  properties: {
    nickname: {
      title: "Surnom du joueur",
      type: "string",
      minLength: 2
    },
    name: {
      title: "Prénom et Nom du joueur",
      type: "string",
      minLength: 2
    },
    email: {
      title: "Courriel",
      type: "string",
      pattern: "^\\S+@\\S+$"
    },
    faction: {
      title: "Faction",
      type: "string"
    },
    "comments": {
      "type": "array",
      "maxItems": 2,
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "title": "Name",
            "type": "string"
          },
          "email": {
            "title": "Email",
            "type": "string",
            "pattern": "^\\S+@\\S+$",
            "description": "Email will be used for evil."
          },
          "spam": {
            "title": "Spam",
            "type": "boolean",
            "default": true
          },
          "comment": {
            "title": "Comment",
            "type": "string",
            "maxLength": 20,
            "validationMessage": "Don't be greedy!"
          }
        },
        "required": [
          "name",
          "comment"
        ]
      }
    },
    comment: {
      title: "Comment",
      type: "string"
    }
  },
  required: ["name", "email", "faction"]
};
