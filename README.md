# montreal-community-centers-map-published
Montreal elderly community and recreation centers map

https://sd-00-123.github.io/montreal-community-centers-map-published/

## A3 feature: [a live button/feature]
For A3 I will add a live feature using open source api, so that my user can know the weather conditions on real time on any point htey click on the map.
It has depth because it (computes / responds / brings in) complementry data that would be useful for the user.
I will know it works when my pop up of weather data is on my map after I clicked any random point in Montreal.
My edge case is data allows live weather pop up so long as it does not break the console..

Test 1. I [click any point on the map].
  Expected: [see live weather data on the point the user clicked].
  Passed; a weather pop up appeared in 3 seconds after a click event.

Test 2. I [click on an actual data point on the map].
    Expected: [see live weather data for the clicked data point].
  Passed: I see the live weather pop up in an actually data point.

Test 3. I [the user clickes outide of Montreal].
  Expected: [show a message that weather is available only on Montreal Island, without calling the weather API.]
Passed: a message appeared and no weather API request was made.
-------------------------------------------

Another Feature Test: TO BE TESTED
From Extra earthquake module warm up
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
------------------------------------------
Other ideas:
have an addition feature that saves a location a user wants with "add to my saved places" similar to google maps


In site/app.js, add a search box above the map that filters the features
in [layer variable] by the property [field]. Matching ignores capitals and
accents. Show '[n] of [total] shown' under the box. If nothing matches,
show 'No match' and keep the full map. These three tests must pass:
1. [normal case]  2. [edge case]  3. [edge case].
Do not add libraries. Before writing code, explain your plan in five
lines. Then show the diff and say which lines are the handler.


git status
git add site/mtl_places_clean_output.geojson
git commit -m "code for search box "
git push



git status
git add site/app.js
git commit -m "changed weather pop up feature"
git push
