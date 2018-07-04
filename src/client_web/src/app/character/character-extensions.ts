// When casting from json, we get a javascript object that can't have any methods.
// Thus, we use these static methods to overcome that problem.
export class CharacterExtensions{
  public static countTotalXp(char: Character): number{
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

  private static countSkillsXp(skills: Skill[]): number{
      let total_xp = 0;
      if (skills !== undefined && skills !== null) {
          for (let i = 0; i < skills.length; i++) {
              total_xp += CharacterExtensions.zeroOrLength(skills[i].options);
          }
      }
      return total_xp;
  }

  private static zeroOrLength(value: any[]): number{
      if(value !== undefined && value !== null){
          return value.length;
      }
      return 0;
  }
}
