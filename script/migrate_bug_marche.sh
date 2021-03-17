#!/usr/bin/env sh
ACTUAL_PATH="$(dirname "$(readlink -f "$0")")"

FILE="${ACTUAL_PATH}/../database/tl_user.json"

echo "Edit ${FILE}"

sed -i 's/"sub_merite": "March\\u00e9 Apothicaire"/"sub_merite": "March\\u00e9 Source Magique"/g' ${FILE}

sed -i 's/"sub_marche": "March\\u00e9 Apothicaire"/"sub_marche": "Source Magique"/g' ${FILE}
sed -i 's/"sub_marche": "March\\u00e9 Laboratoire"/"sub_marche": "Laboratoire"/g' ${FILE}
sed -i 's/"sub_marche": "March\\u00e9 Atelier"/"sub_marche": "Atelier"/g' ${FILE}
sed -i 's/"sub_marche": "March\\u00e9 Cercle Runique"/"sub_marche": "Cercle Runique"/g' ${FILE}
sed -i 's/"sub_marche": "March\\u00e9 Forge"/"sub_marche": "Forge"/g' ${FILE}
sed -i 's/"sub_marche": "March\\u00e9 Pharmacie"/"sub_marche": "Pharmacie"/g' ${FILE}
sed -i 's/"sub_marche": "March\\u00e9 Distillerie"/"sub_marche": "Distillerie"/g' ${FILE}

echo "End of replace in text"
