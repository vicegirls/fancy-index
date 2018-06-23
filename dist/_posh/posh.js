const loaded = new Promise(function(resolve, reject){
    window.addEventListener("load", resolve);
});

const fixTable = function() {
    const table = document.querySelector("table");

    // Remove <hr>s
    Array.from(table.querySelectorAll("hr")).forEach(({ parentNode }) => {
        const row = parentNode.parentNode;
        row.parentNode.removeChild(row);
    });

    // Make a table head.
    const thead = document.createElement("thead");
    const firstRow = table.querySelector("tr");

    firstRow.parentNode.removeChild(firstRow);
    thead.appendChild(firstRow);
    table.insertBefore(thead, table.firstElementChild);

    // Remove the first column and put the image in the next.
    const rows = Array.from(table.querySelectorAll("tr"));
    const tbody = document.querySelectorAll("tbody");
    const rowo = document.querySelectorAll("tbody tr");
    const rowParent = tbody[0].firstElementChild;
    const rowParentEls = rowParent.children;
    const rowParentDir = document.createElement("caption");

    rows.forEach((row, i) => {
        const iconColumn = row.children[0];
        const fileColumn = row.children[1];

        // Remove icon column.
        row.removeChild(iconColumn);

        const image = iconColumn.firstElementChild;

        if (!image) {
            return;
        }

        // Wrap icon in a div.img-wrap.
        const span = document.createElement("span");
        span.className = "file-icon";
        span.appendChild(image);

        // Insert icon before filename.
        fileColumn.insertBefore(span, fileColumn.firstElementChild);

        if(i == (rows.length - 1)) {
            for(i = 0; i < rowParentEls.length; i++){
                rowParentEls[i].className = "caption-text";
                rowParentDir.innerHTML += `${rowParentEls[i].innerHTML}`;
                if(i == (rowParentEls.length - 1)) {
                    tbody[0].firstElementChild.remove();
                    tbody[0].before(rowParentDir);
                }
            };
        }
    });
};

// Underscore string's titleize.
const titleize = function(str) {
    return decodeURI(str).toLowerCase().replace(/(?:^|\s|-)\S/g, function(match, offset) { 
       return match.toUpperCase();
    });
};

const addTitle = function() {
    let path = window.location.pathname.replace(/\/$/g, '');
    let titleText;

    if (path) {
        const parts = path.split('/');
        path = parts[parts.length - 1];
        titleText = titleize(path).replace(/-|_/g, ' ');
    } else {
        titleText = window.location.host;
    }

    titleText = `${titleText}`;

    const container = document.createElement('div');
    container.id = 'page-header';
    const h1 = document.createElement('h1');
    h1.appendChild(document.createTextNode(titleText));
    container.appendChild(h1);

    document.body.insertBefore(container, document.body.firstChild);
    document.title = titleText;
};

function addContainer() {
    const originalBodyContent = document.body.innerHTML;
    const container = "<div class=\"container\">\n" + originalBodyContent + "\n</div>";

    document.body.innerHTML = container;
};

const getDaysInMonth = (month, year) => {     
    if( typeof year == "undefined") year = 1999; // any non-leap-year works as default     
    var currmon = new Date(year,month),     
        nextmon = new Date(year,month+1);
    return Math.floor((nextmon.getTime()-currmon.getTime())/(24*3600*1000));
};

const getDateTimeSince = (target) => { // target should be a Date object
    let now = new Date(), 
        diff = Number(), 
        yd = Number(), md = Number(), dd = Number(), hd = Number(), nd = Number(), sd = Number(), 
        out = [];

    diff = Math.floor( now.getTime() - target.getTime() / 1000 );

    yd = now.getFullYear() - target.getFullYear();
    md = now.getMonth() - target.getMonth();
    dd = now.getDate() - target.getDate();
    hd = target.getHours() - now.getHours();
    nd = target.getMinutes() - now.getMinutes();
    sd = target.getSeconds() - now.getSeconds();

    if(md < 0) { yd--; md += 12; }

    if(dd < 0) {
        md--;
        dd += getDaysInMonth( now.getMonth() - 1, now.getFullYear() );
    }

    if(hd < 0) { dd--; hd += 24; }
    if(nd < 0) { hd--; nd += 60; }
    if(sd < 0) { nd--; sd += 60; }

    if(yd > 0) out.push( yd + " year" + (yd == 1 ? "" : "s ") );
    if(md > 0) out.push( md + " month" + (md == 1 ? "" : "s ") );
    if(dd > 0) out.push( dd + " day" + (dd == 1 ? "" : "s ") );
    if(hd > 0) out.push( hd + " hour" + (hd == 1 ? "" : "s ") );
    if(nd > 0) out.push( nd + " minute" + (nd == 1 ? "" : "s ") );
    if(sd > 0) out.push( sd + " second" + (sd == 1 ? "" : "s ") );

    return Array.from(out);
};

const makeElapsedString = (arr) => { // Argument should be an array produced by getTimeSince()
    var timeSince = "";
    var limit = 6; // Subtract from the array to limit the visible time divisions
    
    if(arr.length <= limit) {
        switch(arr.length) {
            case 1:
                limit = 0;
                break;
            case 2:
                limit = 0;
                break;
            case 3:
                limit = 1;
                break;
            case 4:
                limit = 2;
                break;
            case 5:
                limit = 3;
                break;
            case 6:
                limit = 4;
                break;
            default:
                limit = 0;
                break;
        }
    }

    let i = 0;

    for(i = 0; i < (arr.length - limit); i++) {
        timeSince += `${arr[i]}`;
        if(i <= limit) { timeSince += " "; } else { timeSince += ""; }
    }

    return `${timeSince} ago`;
};

const insertElapsed = () => {

    const lastModCells = Array.from( document.querySelectorAll("td.indexcollastmod") );
    let i = 0;
    let stamp, parts, dateStr, timeStr, year, 
        monthIndex, month, day, hour, minutes, 
        fileTime, elapsedArr, elapsedStr;

    if( lastModCells.length == 0 ) { return; }

    for(i = 0; i < lastModCells.length; i++) {
        if(i >= 0) {
            let elapsedEl = document.createElement("span");
                elapsedEl.className = "lastmodified";

            let stampWrap = document.createElement("span");
                stampWrap.className = "lastmodified-stamp";

            stamp = lastModCells[i].textContent.trim();
            stampWrap.textContent = stamp;
            
            parts = stamp.split(" ", 2);
            dateStr = parts[0].split("-"); timeStr = parts[1].split(":");
            year = parseInt(dateStr[0], 10);
            monthIndex = dateStr[1] - 1; month = parseInt(monthIndex, 10);
            day = parseInt(dateStr[2], 10); hour = parseInt(timeStr[0], 10); minutes = parseInt(timeStr[1], 10);
            
            fileTime = new Date(year, month, day, hour, minutes, 0);

            elapsedArr = getDateTimeSince(fileTime);
            elapsedStr = makeElapsedString(elapsedArr);
            elapsedStr = elapsedStr.trim();

            lastModCells[i].replaceChild(stampWrap, lastModCells[i].firstChild);
            lastModCells[i].insertAdjacentElement("beforeend", elapsedEl).innerHTML = `&nbsp;${elapsedStr}`;
        }
    }

};

class Search {
    constructor(init) {
        if(init == "init") {
            this.input = document.createElement("input");
            this.input.type = "search";
            this.input.id = "search";
            this.input.setAttribute("placeholder", "Search");
            document.getElementById("page-header").appendChild(this.input);
            this.sortColumns = Array.from(document.querySelectorAll("thead a"));
            this.nameColumns = Array.from(document.querySelectorAll("tbody .indexcolname"));
            this.rows = this.nameColumns.map(({ parentNode }) => parentNode);
            this.fileNames = this.nameColumns.map(({ textContent }) => textContent);
            
            this.filter("");
        } else {
            this.sortColumns = Array.from(document.querySelectorAll("thead a"));
            this.nameColumns = Array.from(document.querySelectorAll("tbody .indexcolname"));
            this.rows = this.nameColumns.map(({ parentNode }) => parentNode);
            this.fileNames = this.nameColumns.map(({ textContent }) => textContent);
        }
        
    }

    filter(str) {
        const colSort = this.sortColumns;
        const colName = this.nameColumns;
        const rows = this.rows;
    

        colSort.forEach((link) => {
            if(str) {
                link.tabIndex = -1;
            } else {
                link.removeAttribute("tabIndex");
            }
        });

        let even = false;

        colName.forEach((name, i) => {
            let rowClasses = rows[i].classList;
            if (!str || name.innerText.toLowerCase().includes(str.toLowerCase())) {
                rowClasses.remove("hidden");
            } else {
                rowClasses.add("hidden");
            }
        });
    }
    
    static async inputMon(){
        try {
            const searchBar = await document.getElementById("search");
            const search = await new Search("no");
            await searchBar.addEventListener("input", function(event){
                search.filter(event.target.value);
                console.log(`Monitoring: ${searchBar}`);
            });
        } catch(err) {
            console.log(`Failed to attach monitor to input.`, err);
        }
    }
}

loaded.then(function(){
   fixTable(); addTitle(); insertElapsed(); addContainer();
   const buildSearch = new Search("init");
   return Search.inputMon();
});