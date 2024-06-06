let inputForm = document.querySelector('form');
let symbolInput = document.querySelector('#input-symbol');
let timeInput = document.querySelector('#input-time-frame');
let listHeader = document.querySelector('.watchlist-header');
let listContainer = document.querySelector('.watchlist');
let list = document.querySelector('.watchlist-unordered');
let modalContainer = document.querySelector('.floating-modal');
let modalHide = document.querySelector('#modalHide');
let loader = document.querySelector('.loader-container');
let topDiv = document.querySelector('.top-div')
let navBar = document.querySelector('nav');
let inputContainerDiv=document.querySelector('.input-section-container');
let searchBtn = document.querySelector('button.search');
// let themebtn=document.querySelector('#light-dark');
let footeryear = document.querySelector('#footer-year');
let dateShowingTag = document.querySelector('.date-showing-nav-p');

//Updating the date and time regularly
setInterval(()=>{
    let curr_Date = new Date();
    dateShowingTag.textContent=`${curr_Date.toDateString()} ${curr_Date.toLocaleTimeString()}`;
},1000);

//function to create elements and add attributes
const creatingAndAddingAttributes = (tagName, contentText, className, idName) => {
    const el = document.createElement(tagName);

    if (contentText) {
        el.textContent = contentText;
    }
    if (className) {
        el.classList.add(className);
    }
    if (idName) {
        el.setAttribute('id', idName);
    }

    return el;
}

//creating loading symbol
const loadingSymbol = creatingAndAddingAttributes('p', 'Loading...', undefined, 'loadingSymbol');
const loadingSymbolCSS = creatingAndAddingAttributes('span',undefined,undefined,'loadingcircleicon');

//updating year in footer by date object
const currentYear=new Date().getFullYear();
footeryear.textContent=currentYear;

//fetching api
const apiCall = (symbolInput, timeInput) => {
    let api_url;
    if (timeInput.value === 'INTRADAY') {
        api_url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbolInput.value.toUpperCase()}&interval=5min&apikey=02FKR6RLF9YK8G08`;
    } else {
        api_url = `https://www.alphavantage.co/query?function=TIME_SERIES_${timeInput.value}&symbol=${symbolInput.value.toUpperCase()}&apikey=02FKR6RLF9YK8G08`;
    }

    loader.append(loadingSymbolCSS,loadingSymbol);
    loader.style.padding='10px';

    fetch(api_url)
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            console.log(data);
            if (timeInput.value === 'INTRADAY') {
                timeValue = data[`Time Series (5min)`]
            } else if (timeInput.value === 'WEEKLY') {
                timeValue = data[`Weekly Time Series`]
            } else {
                timeValue = data[`Monthly Time Series`]
            }
            console.log(timeValue);
            const liStockValue = timeValue[`${Object.keys(timeValue)[0]}`]['1. open'];

            //removing lodaing symbol once the data is fetched
            loadingSymbol.remove();
            loadingSymbolCSS.remove();
            loader.style.padding='0px';

            createListItems(liStockValue, timeValue);
        })

        //Handling Errors in case of Invalid Symbols entered
        .catch(()=>{
            alert('Unable to fetch data. Invalid Symbol or More frequent API calls!');
            loadingSymbol.remove();
            loadingSymbolCSS.remove();
            loader.style.padding='0px';
            //Restoring the home page if there is nothing to show in watchlist
            if(list.childNodes.length===0){
                listHeader.classList.add('v-none');
                topDiv.style.height='100vh';
                inputContainerDiv.style.margin='25vh 0';
                listContainer.style.minHeight='auto';
                listContainer.style.padding='0';
            }
        })
}

//function to create and add watchlist items
const createListItems = (liStockValue, timeValue) => {
    const li = creatingAndAddingAttributes('li', undefined, 'watchlist-item', undefined);

    const liSymbolName = creatingAndAddingAttributes('p', `${symbolInput.value.toUpperCase()}`, undefined, 'formSymbol');
    const liStockPoints = creatingAndAddingAttributes('p', `${liStockValue}`, undefined, 'liStockOpenPoints');
    const liTimeValue = creatingAndAddingAttributes('p', `${timeInput.value}`, undefined, 'formTimeFrame');

    const liDeleteBtn = creatingAndAddingAttributes('button', undefined, 'listDeleteButton', undefined);
    liDeleteBtn.innerHTML = `&#10006;`;

    li.append(liSymbolName, liStockPoints, liTimeValue, liDeleteBtn);

    liDeleteBtn.addEventListener('click', (e) => {
        e.target.parentNode.remove();
        modalContainer.classList.add('v-none');

        //hiding the header when list is empty
        if (list.childNodes.length === 0) {
            listHeader.classList.add('v-none');
            topDiv.style.height='100vh';
            inputContainerDiv.style.margin='25vh 0';
            listContainer.style.minHeight='auto';
            listContainer.style.padding='0';
        }
    })

    li.addEventListener('click', (event) => {
        if (event.target.className === "listDeleteButton") {
            return;
        }
        //making the modal visible on list item click
        modalContainer.classList.remove('v-none');

        //adding the values of top 5 stock data of the selected time frame to the table
        addingDatatoTable(timeValue);
    })

    //adding the list item to the watchlist
    list.appendChild(li);
    //making the header visible on list items addition
    if (list.childNodes.length > 0) {
        listHeader.classList.remove('v-none');
    }
}

//hiding the modal on button click
modalHide.addEventListener('click', () => {
    modalContainer.classList.add('v-none');
})

//submit event listener on the input form
inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    topDiv.style.height='auto';
    inputContainerDiv.style.margin='auto';
    listContainer.style.minHeight='55vh';
    listContainer.style.padding='1rem 0';
    apiCall(symbolInput, timeInput);
})

//function to add timeframe data to the modal table
const addingDatatoTable = (timeValue) => {

    document.getElementById('row1data1').textContent = `${symbolInput.value.toUpperCase()} ${timeInput.value}`

    document.getElementById('row2data1').textContent = Object.keys(timeValue)[0];
    document.getElementById('row2data2').textContent = `${timeValue[`${Object.keys(timeValue)[0]}`]['1. open']}`;
    document.getElementById('row2data3').textContent = `${timeValue[`${Object.keys(timeValue)[0]}`]['2. high']}`;
    document.getElementById('row2data4').textContent = `${timeValue[`${Object.keys(timeValue)[0]}`]['3. low']}`;
    document.getElementById('row2data5').textContent = `${timeValue[`${Object.keys(timeValue)[0]}`]['4. close']}`;
    document.getElementById('row2data6').textContent = `${timeValue[`${Object.keys(timeValue)[0]}`]['5. volume']}`;

    document.getElementById('row3data1').textContent = Object.keys(timeValue)[1];
    document.getElementById('row3data2').textContent = `${timeValue[`${Object.keys(timeValue)[1]}`][`1. open`]}`
    document.getElementById('row3data3').textContent = `${timeValue[`${Object.keys(timeValue)[1]}`][`2. high`]}`
    document.getElementById('row3data4').textContent = `${timeValue[`${Object.keys(timeValue)[1]}`][`3. low`]}`
    document.getElementById('row3data5').textContent = `${timeValue[`${Object.keys(timeValue)[1]}`][`4. close`]}`
    document.getElementById('row3data6').textContent = `${timeValue[`${Object.keys(timeValue)[1]}`][`5. volume`]}`

    document.getElementById('row4data1').textContent = Object.keys(timeValue)[2];
    document.getElementById('row4data2').textContent = `${timeValue[`${Object.keys(timeValue)[2]}`][`1. open`]}`
    document.getElementById('row4data3').textContent = `${timeValue[`${Object.keys(timeValue)[2]}`][`2. high`]}`
    document.getElementById('row4data4').textContent = `${timeValue[`${Object.keys(timeValue)[2]}`][`3. low`]}`
    document.getElementById('row4data5').textContent = `${timeValue[`${Object.keys(timeValue)[2]}`][`4. close`]}`
    document.getElementById('row4data6').textContent = `${timeValue[`${Object.keys(timeValue)[2]}`][`5. volume`]}`

    document.getElementById('row5data1').textContent = Object.keys(timeValue)[3];
    document.getElementById('row5data2').textContent = `${timeValue[`${Object.keys(timeValue)[3]}`][`1. open`]}`
    document.getElementById('row5data3').textContent = `${timeValue[`${Object.keys(timeValue)[3]}`][`2. high`]}`
    document.getElementById('row5data4').textContent = `${timeValue[`${Object.keys(timeValue)[3]}`][`3. low`]}`
    document.getElementById('row5data5').textContent = `${timeValue[`${Object.keys(timeValue)[3]}`][`4. close`]}`
    document.getElementById('row5data6').textContent = `${timeValue[`${Object.keys(timeValue)[3]}`][`5. volume`]}`

    document.getElementById('row6data1').textContent = Object.keys(timeValue)[4];
    document.getElementById('row6data2').textContent = `${timeValue[`${Object.keys(timeValue)[4]}`][`1. open`]}`
    document.getElementById('row6data3').textContent = `${timeValue[`${Object.keys(timeValue)[4]}`][`2. high`]}`
    document.getElementById('row6data4').textContent = `${timeValue[`${Object.keys(timeValue)[4]}`][`3. low`]}`
    document.getElementById('row6data5').textContent = `${timeValue[`${Object.keys(timeValue)[4]}`][`4. close`]}`
    document.getElementById('row6data6').textContent = `${timeValue[`${Object.keys(timeValue)[4]}`][`5. volume`]}`

}