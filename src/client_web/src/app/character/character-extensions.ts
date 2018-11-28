import {Character} from './character';

// When casting from json, we get a javascript object that can't have any methods.
// Thus, we use these static methods to overcome that problem.
export class CharacterExtensions {
  public static countTotalXp(char: Character): number {
    return char.xp_naissance + char.xp_autre;
  }

  public static countSpentXp(char: Character): number {
    let total_xp = 0;

    total_xp += CharacterExtensions.zeroOrLength(char.energie);
    total_xp += CharacterExtensions.zeroOrLength(char.endurance);
    total_xp += CharacterExtensions.countSkillsXp(char.habilites);
    total_xp += CharacterExtensions.countSkillsXp(char.technique_maitre);

    return total_xp;
  }

  public static countMasterTech(char: Character): number {
    return CharacterExtensions.countSkillsXp(char.technique_maitre);
  }

  public static countRitualSchools(char: Character): number {
    let total = 0;
    if (char.sous_ecole !== undefined && char.sous_ecole !== null) {
      for (let school of char.sous_ecole) {
        if (school.ecole !== undefined && school.sous_ecole !== undefined) {
          total++;
        }
      }
    }
    return total;
  }

  public static maxRitualSchools(char: Character): number {
    // TODO I don't know logic for this
    return 0;
  }

  private static countSkillsXp(skills: Skill[]): number {
    let total_xp = 0;
    if (skills !== undefined && skills !== null) {
      for (let i = 0; i < skills.length; i++) {
        total_xp += CharacterExtensions.zeroOrLength(skills[i].options);
      }
    }
    return total_xp;
  }

  private static zeroOrLength(value: any[]): number {
    if (value !== undefined && value !== null) {
      return value.length;
    }
    return 0;
  }
}
