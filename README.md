# HousingInBayArea
This is the source code for website "Housing in Bay Area".
The goal of this project is to visualize data collected from popular housing websites. Readers can see information of some cities, as well as the monthly median value of a house with different number of bedrooms changein different city. The website also shows the monthly inventory. The website also shows the monthly inventory change of new listing, monthly inventory change of pending listing and monthly change of Bitcoin


## Prerequisites 
[Python3](https://www.python.org/downloads/)

## Local Development and Testing

#### Download
In your terminal. go to the directory where you want to work with this project with either HTTP 
````
git clone https://github.com/eggchul/HousingInBayArea.git
````
or SSH
````
git clone git@github.com:eggchul/HousingInBayArea.git
````

#### Run in Local
After download the project, on your terminal, go to the project directory and host a http server
````
cd ./HousingInBayArea
python3 -m http.server
````

#### Try Out Website in Local
After starting http server, go to [http://localhost:8000/](http://localhost:8000/)

### Libraries

##### [D3 V6](https://d3js.org/)
This project is developed with D3 v6, if referencing to works developed with other versions of D3 for future development, please check [D3 API Documentation](https://github.com/d3/d3/blob/master/API.md)
or [D3 wiki](https://d3-wiki.readthedocs.io/zh_CN/master/API-Reference/) to avoid deprecated methods.
##### [D3 Legend](https://d3-legend.susielu.com/)
##### [D3 Annotation](https://d3-annotation.susielu.com/)
##### [W3.CSS](https://www.w3schools.com/w3css/)

### Files and Folders
#### raw data
This folder contains all the raw data collected from Zillow, Realtor and Kaggle. Also a jupyter notebook file of data cleansing.

#### report images
This folder contains all the images that are used in the report

#### index.html
this file is the main screen 

### Future Works
- Add  timeline  of  historical  events.  This  is  not  limited  to housing related news, but could be some big event. Some readers  might  have  a  change  to  identify  some  potential relationships with the news and housing market change.
- A bar chart race of housing price change over time among cities. This could save some readers time in investigating data piece by piece. Readers can have a general idea of the bay area housing market more complete.
- Introduce discussion section in the website. Readers can leave  comment  and  share  their  thoughts.  This  approach could help improving the website quality

