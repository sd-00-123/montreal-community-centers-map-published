


page
https://sd-00-123.github.io/montreal-community-centers-map-published/

https://sd-00-123.github.io/montreal-community-centers-map-published/site

Site URL
https://sd-00-123.github.io/montreal-community-centers-map-published/site/?v=accessibility-panel-20261113


Features Added: A3
1. Weather api data turned into slider 
    Need: proper threshold of good, caution bad indicators
2. Three Nearest places from a click

------------------------------------------------------------
        Post Testing Nov 11th: Synthesised and Prioritized Notes


OVERLAPPING POINTS: Priority

1. 
DONE	a. Get directions on pop-up > link to google maps 

DONE	b. Transit: Wouldn't know how to get to the place they want to go
			Idea: merge with google maps like TEST 1 above

2. 
DONE	a. Redefines search case sensitive etc. 
		TEST 1 and 3

3. 
DONE	b. Make bus and metro stops layer pop up 
        TEST 2 borough legend toggle off layer (only for data use)

4. 
DONE    c. Alphabetical borough filter
		TEST 2 and 3


Other changes:
a. DONE changed borough legend layer to toggle feature 
	b. color now grey for NONE category in legend

b. added threshold for weather conditions so slider should have good, caution and bad ratings now

c. added arrow head and circle markers to all nerest data points on click event
	added metro stations to nearest option list 
	added park to nearest option list 

d. added description and accessability in panel on click event 

e. added serach box drop down menu
	- expanded seach to numbers for adresses
	- partial match

f. Separated arts and culture from community centers name (legend and pop up)
	now onyl shows 'community centers' as name


Note:
1. Need overlay or hghight of borough clicked / searched on 

2. A bit more visual display for data button to be more obvious to click on 


See if a transitroute can be made with the stop routes. 
demostrate if nerest options can actually take you to destination?

Still need A to B option route

Still need 211 grnad montreal api for additional commnunity centers not municiaply regonnised


----------------------------------------------------------------
					TESTING DAY NOTES:

Test 1: one person

Searched words:
	• Diorval 
	• Point Claire 

Buttons Used: Features 
	- Weather slider 
	- Nearest places on click

Suggestions:
	1. Add a highlight of the locations from the click event 
	In addition to the line 
	
	2. Get directions on pop-up > link to google maps 
	
Change:
	1. Hard to click and differentiate each data point 
	
	2. Needs clearer borough search 

DONE 3. Shows data point if even outside of borough 
	
DONE Or direction "filter through boroughs to see map 

	3. A bit more visual display for data button to be more obvious to click on 
	
WHAT IS CLEAR ON THE MAP:
	- Toggle buttons clear 
	- Colors clear 

DONE Possible BUG: Need circles to pop up after click (for borough-borough nearest place)

Possible toggles:
	- Churches

DONE  Find case sensitive for search button 	
		Eg: park > drop down of anything remotely related to parks

OVERALL:
	- Confusing and overwhelming of points of the map 
	- Classification of use of buttons

	- Data is good 
Synthesis need work 


------------------------------------------
Test 2: one person

WHAT GOOD ON THE MAP:
	- For elderly community and see locations of what their into / bus stops 
	- Colors show difference 
	- Boroughs are easy to find 

Change:
DONE	1. Transit: Wouldn't know how to get to the place they want to go
			My Idea: merge with google maps like TEST 1 above

	2. Zoom is confusing: Don't zoom in as much 
	
DONE  3. Also have datapoint from other borough / cross boroughs for closest place clicked

DONE	1. Separate arts and culture from community centers name (legend and pop up)
	

Suggestions:
DONE	1. Add closets parks with bus stops 

Done	2. Alphabetical order of borough filters 

?CHECK	3. Add type with installation to get more information on the place itself 
		Walk around field vs area (what type)
		Partly description
		Eg: Shade, benches 

how?  4. Insert picture from each pop up 

	5. Add feature to know Is it actually walkable? Or transit?
		More information about bus for bus lines: direction, NS etc. 

	6. Add slide side bar for events / tables  on a different pane on the left 
		Map > 
		Table > 

DONE	7.  Color should be grey in null boroughs (with no data)
	
OVERALL:
	- Straightforward 
	- Basic map 
	- Elderly= there's a color it should mean something

------------------------------------------
Test 3: group

Suggestions:
Done	1. Add a toggle off layer for community borough concentration 
				Idea: like TEST 2 null grey boroughs correspond above
DONE		a. Make bus stops layer pop up 
       			 TEST 2 borough legend toggle off layer (only for data use)

	2. Language button larger 

DONE	3. Classify alphabetically boroughs in filter 
			TEST 2 and 3

	4. Have more colors to differentiate 

DONE    5. Minimizes emergency stops collapsable panel on the right 

	6. Filter out zoom to make it less jittery
		TEST 2 and 3

	7. Change dot (pop-up) shapes 
		Eg: green = trees

	8. Remove loading map = confusing 

DONE	9. Redefines search case sensitive etc. 
		TEST 1 and 3
	
DONE	10. Alphabetical borough filter
		TEST 2 and 3

-------------------------------------------------
Other ideas:
1. Have an addition feature that saves a location a user wants with "add to my saved places" similar to google maps

2. Have a open souce portion for users to input other unknown locations or update pop up info ONLY
sort of like a editable front end page?
-------------------------------------------



updated README: your fix with before and after screenshots; your feature explained (which lines do the work, in your own words, and one thing you do not yet fully understand); and your A3 AI disclosure, written as process.


------------------
git status
git add site/mtl_places_clean_output.geojson
git commit -m "code for search box "
git push

--------------------------------
Tailored message:
git status
git add README.MD
git commit -m "Update"
git push


