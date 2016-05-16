// Schéma de Traitre-Lame
var DATABASE_SCHEMA = {
  type: "object",
  title: "Comment",
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
    comment: {
      title: "Comment",
      type: "string"
    }
  },
  required: ["name", "email", "faction"]
};
