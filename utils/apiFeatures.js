class APIFeatures { //Create a reuseable module, later we'll import in other controllers
    constructor(query, queryString) {
    //automatically called when create a new obj, 1st mongoose query, 2nd query string from route. 
    this.query = query; //query that we get as an argument for database,
    this.queryString = queryString; //queryString at the request url
    }
    filter(){ //create one method for each of the functionality
        //const queryObj = {...req.query};//query object is a reference req.query,so use destructuring and create a new obj.
        // console.log('Query string is : ', this.queryString);
        const queryObj = { ...this.queryString };
        console.log(queryObj);
        const excludedFields = ['page','sort','limit','fields']; //array of fields that we want to exclude
        excludedFields.forEach(el => delete queryObj[el]); //from queryObj we delete the field with name of element
        // console.log(this.queryString, queryObj);
        // 1B) Advance filtering     
        let queryStr = JSON.stringify(queryObj); //Convert JS object to  Json string
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //using RE, 2nd is callback, 
        // console.log('kiki', queryStr);
        //pass match string as 1st and return  the new string that will match the old one.
        // console.log(JSON.parse(queryStr));
        // {difficulty: 'easy' , duration: {$gte : 5}} //this is the filter obj in the url
        // {difficulty: 'easy' ,duration: { gte: '5' }} //this is query obj
        //we want to replace gte, gt, lte, lt
        this.query = this.query.find(JSON.parse(queryStr));
        //let query = Tour.find(JSON.parse(queryStr)); //implementing a simple filter, Tour.find returns a query
        return this; //return this entire obj which then have access to other methods
    }
    sort() {
        // 2) SORTING
        //  if(req.query.sort){
        if(this.queryString.sort){
            //const sortBy = req.query.sort.split(',').join(' ');//split the strings by comma, then return array 
            console.log('sort is ' , this.queryString.sort);
            const sortBy = this.queryString.sort.split(',').join(' ');//split the strings by comma, then return array
            //of all fields names and then join the strings by space
            // console.log(sortBy)
            this.query = this.query.sort(sortBy); //sort according to accending order 
        }
        else { //adding a default one, if user doesn't specify sort fields in query string.
            this.query = this.query.sort('-createdAt'); //sort by created at field by desending order.
        }
        return this;
    }
    limitFields(){
        //3) FIELD LIMITIN
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        else{ //if user doesn't specify the fields
            this.query = this.query.select('-__v'); //-__v means excluding this field.
        }
        return this;
    }
    paginatie(){
        // 4)PAGINATION
        //1st get the page and limit from query string, and define some default values
        const page = this.queryString.page * 1 || 1; // || 1 means by default page 1
        const limit = this.queryString.limit * 1 || 100; // 1 page contain 100 results/documents
        const skip = (page-1) * limit;
        // page:2&limit:10, 1-10=>page1 , 11-20=>page2 , 21-20=>page3  
        this.query = this.query.skip(skip).limit(limit);
        //If user select wrong pages and limit.
        // if(this.queryString.page){
        //     const numTours = await Tour.countDocuments(); // return the no of documents as a promise
        //     if(skip >= numTours) throw Error('This page doesnot exist'); //this throw error move to catch block
        // }
        return this;
    }
}
module.exports =  APIFeatures;