page
https://sd-00-123.github.io/montreal-community-centers-map-published/

https://sd-00-123.github.io/montreal-community-centers-map-published/site

Site URL
https://sd-00-123.github.io/montreal-community-centers-map-published/site/?v=accessibility-panel-20261113


Features Added: A3
1. Weather api data turned into slider 
2. Three Nearest places from a click


## Part 3: what I found, and one fix
Evidence: 
The tester found the website should have a better intergration of a transit route. Clicked on the map but wanted to see feasbile transit. "It would be good the have the google map link in your popup" Test 1 and 2

Severity: 
2 since they were still able to navigate the map and see community centers. They said having a transit option wasn't a problem since they could paste my popup adress of the place on google maps in a diffrent browser.

My change: 
I will/did change before this lab, the google maps link embedded into my pop up

Recheck: Fixed: 
they were able to click the popup and get directions from their location.

Fixed means: they do it without hesitating at that spot

ALSO FIXED:
My testers suggested putting my borough filter in alphabetical order 
I fixed that this morning as well befrore the lab.
I did about 5 fixes from their suggestions from small and big. 

AI DISCLOSURE: A3 M8 
Most of my post testing fixes were done using the git educaiton AI. For example, I didn't know how to make a toggle eature for my community centers per borough density layer, so I tell the AI the make a toggle feature on the legend just for this layer. This change was in app.js at lines 1495 to 1509 as well as 809 to 819 for layer added to map if I am not mistaken. 
On thing I don't fuly understand is after asking for htis change. I don't know why the layer doesn't stay underneath the community centers data layer. I tried to locate the layer in app.js but didn't change or switch layers since I didn't fully know where the code starts and ends / how to trasition the layer properly. 



--------------------------------

git status
git add README_working.md
git commit -m "Update"
git push


