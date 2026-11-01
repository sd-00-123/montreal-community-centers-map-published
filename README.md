# montreal-community-centers-map-published
Montreal elderly community and recreation centers map

## A3 feature: [a search button/feature]
For A3 I will add a search feature, so that my reader can search community centers nearedt to them. and finds the three closest to them
It has depth because it (computes / responds / brings in) answers the user is looking for.
I will know it works when searching centers / centres works in the serach box.
My edge case is search comes up emtpy.

Test 1. I [search community centers/res in search box].
  Expected: [exactly what appears or changes].
Test 2. I [click on community centers or anywhere on the map].
  Expected: [returns nothing or points to three nearest things that the user typed in the search box]
Test 3. I [the user types in a typo].
  Expected: [no "searched thing" was found; no console error].

git status
git add site/mtl_places_clean_output.geojson
git commit -m "code for search box "
git push