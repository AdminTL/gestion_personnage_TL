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
    "sous_faction": {
      title: "Sous-faction",
      type: "string",
    },
    endurance: {
      title: "Endurance",
      type: "array",
      items: {type: "string"}
    },
    energie: {
      title: "Énergie",
      type: "array",
      items: {type: "string"}
    },
    habilites: {
      type: "array",
      items: {
        type: "object",
        properties: {

          discipline: {
            title: "Discipline",
            type: "string"
          },

          habilite: {
            title: "Habilité",
            type: "string"
          },

          options: {
            title: "Option",
            type: "array",
            items: {type: "string"}
          },

        },
        required: [
          "discipline",
          "habilite"
        ]
      }
    },
    technique_maitre: {
      type: "array",
      title: "Techniques de Maitre",
      maxItems: 10,
      minItems: 0,
      uniqueItems: true,
      items: {
        title: "Technique de Maitre",
        type: "string"
      }
    },
    comment: {
      title: "Comment",
      type: "string"
    }
  },
  required: ["name", "email", "faction"]
};
