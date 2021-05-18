# HousingInBayArea
This is the source code for website "Housing in Bay Area".
The goal of this project is to visualize data collected from popular housing websites. Readers can see information of some cities, as well as the monthly median value of a house with different number of bedrooms changein different city. The website also shows the monthly inventory. The website also shows the monthly inventory change of new listing, monthly inventory change of pending listing and monthly change of Bitcoin
This project is developed with D3 v6, if referencing to works developed with other versions for future development, please check [D3 API Documentation](https://github.com/d3/d3/blob/master/API.md)
or [D3 wiki](https://d3-wiki.readthedocs.io/zh_CN/master/API-Reference/) to avoid deprecated methods, and check the updated method usage.
## Prerequisites 
[Python3](https://www.python.org/downloads/)

## Local Development and Testing

#### Download
Select your local destination where you want to work with this project with either HTTP 
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
[http://localhost:8000/](http://localhost:8000/)

### Future Works
- Add  timeline  of  historical  events.  This  is  not  limited  to housing related news, but could be some big event. Some readers  might  have  a  change  to  identify  some  potential relationships with the news and housing market change.
- A bar chart race of housing price change over time among cities. This could save some readers time in investigating data piece by piece. Readers can have a general idea of the bay area housing market more complete.
- Introduce discussion section in the website. Readers can leave  comment  and  share  their  thoughts.  This  approach could help improving the website quality

