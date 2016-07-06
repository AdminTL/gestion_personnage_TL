#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import csv
import os


def parse_args():
    parser = argparse.ArgumentParser(description="Migration csv to json rule database.")
    parser.add_argument('--csv', required=True, help='Specify a path of csv file to migrate.')
    parser.add_argument('--output', default="out.csv", help='Specify a path of output file with generate stuff.')
    _parser = parser.parse_args()
    return _parser


def fill_ritual_obj(json_obj, row):
    """
    :param json_obj:
    :param row:
    :return:

    Exemple of output :
    {
      "title": "Rituel",
      "description": "Les rituels sont divisés en x écoles et sous-école.",
      "section": [
        {
          "title": "Démonologie",
          "section": [
            {
              "title": "Possession",
              "section": [
                {
                  "title": "Le dévoreur de tête",
                  "description": [
                    "Augmente les points de vie à 10, donne accès à la technique Décapitation.",
                    [
                      "Coût : 6",
                      "Duration : 1 combat",
                      "Type : Rage"
                    ],
                    "Note : Frénésie non-sauvegardable"
                  ]
                },
                {
                  "title": "La dame de fer",
                  "description": [
                    "Confère 4 point de vie de type armure. Réparable avec une composante magique (hors-combat).",
                    [
                      "Coût : 12",
                      "Duration : 24h",
                      "Type : Bonus"
                    ],
                    "Note : Silence durant toute la possession et maquillage gris ou masque."
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
    """
    if not json_obj:
        lvl_1_section = []
        json_obj["title"] = "Rituel"
        json_obj["section"] = lvl_1_section
    else:
        lvl_1_section = json_obj.get("section", [])

    title = row[0]
    school_name = row[1]
    sub_school_name = row[2]
    cost = row[3]
    description = row[4]
    duration = row[5]
    type = row[6]
    note = row[7]

    # find school
    find_school = False
    for school_obj in lvl_1_section:
        if school_obj["title"] == school_name:
            find_school = True
            break

    if not find_school:
        sub_school_obj = {"title": sub_school_name}
        school_obj = {"title": school_name, "section": [sub_school_obj]}
        lvl_1_section.append(school_obj)
    else:
        # find sub_school
        find_sub_school = False
        school_section = school_obj["section"]
        for sub_school_obj in school_section:
            if sub_school_obj["title"] == sub_school_name:
                find_sub_school = True
                break
        if not find_sub_school:
            sub_school_obj = {"title": sub_school_name}
            school_section.append(sub_school_obj)

    sub_section = sub_school_obj.get("section", [])
    if not sub_section:
        sub_school_obj["section"] = sub_section

    # find sub school, add new data
    ritual_obj = {
        "title": title,
        "description": [description,
                        [
                            "Coût : %s" % cost,
                            "Duration : %s" % duration,
                            "Type : %s" % type
                        ],
                        note]
    }

    sub_section.append(ritual_obj)


def parse_csv(parser):
    """
    Parser csv file and generate python object.
    :param parser: argument application parser
    :return: representation object of csv parsing
    """
    if not os.path.isfile(parser.csv):
        print("Error, try to open csv file %s, but not exist." % parser.csv)
        return

    json_obj = {}
    with open(parser.csv, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',', quotechar='"')
        for row in spamreader:
            print(', '.join(row))
            fill_ritual_obj(json_obj, row)

    return json_obj


def generate_json(parser, serialize_obj):
    with open(parser.output, "w", encoding="utf-8") as json_file:
        json.dump(serialize_obj, json_file, ensure_ascii=False)


if __name__ == '__main__':
    args = parse_args()
    obj = parse_csv(args)
    generate_json(args, obj)
