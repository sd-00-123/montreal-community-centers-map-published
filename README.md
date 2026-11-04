# montreal-community-centers-map-published
Montreal elderly community and recreation centers map

https://sd-00-123.github.io/montreal-community-centers-map-published/site/

## A3 feature: [a live button/feature]
For A3 I will add a live feature using open source api, so that my user can know the weather conditions on real time on any point htey click on the map.
It has depth because it (computes / responds / brings in) complementry data that would be useful for the user.
I will know it works when my pop up of weather data is on my map after I clicked any random point in Montreal.
My edge case is data comes up emtpy / no data.

Test 1. I [click any point on the map].
  Expected: [see live weather data on the point the user clicked].
  Passed
Test 2. I [click on an actually data point on the map].
  Expected: [returns nothing]
  Passed
Test 3. I [the user clickes outide of Montreal].
  Expected: [If availble allow weather data outside Montreal, as long as no error occurs.]
Passed




LATER THIS WEEK I WILL ADD:
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