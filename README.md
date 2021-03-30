#Restful API assignment
Create a Restful API for Registration, Login & a getUserList

#### Dependencies:
1. [`express`](https://expressjs.com/)
2. [`sequelize`](http://docs.sequelizejs.com/)
3. [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken)
4. [`bcrypt`](https://www.npmjs.com/package/bcrypt)
5. [`env-cmd`](https://www.npmjs.com/package/env-cmd)
6. [`cors`](https://www.npmjs.com/package/cors)
7. [`morgan`](https://www.npmjs.com/package/morgan)
8. [`mysql2`](https://www.npmjs.com/package/mysql2)



### Folder Structure
 - `config` ( All config files with envireonment variables)
 - `constants` ( Constants used globally in project )
 - `controllers` ( Business logic layer )
 - `db` ( Database configuration )
 - `middlewares` ( Middlewares & intercepters )
 - `models` ( Database object models )
 - `routes` ( Api routes )
 - `utils` ( Utilities )

### BASE_URL 
localhost:PORT_NO/api/v1/
### System conisits of following API's
1. `POST /users/register`: This api is used to register a user into the system.
    
    Request Body : 
    {
        first_name: "",
        last_name: "" ,
        email: ""  ,
        empId: "" ,  
        password: "" ,
        organization: ""
    }

2. `POST /users/login`: This api is used to login a user. After getting validated returns a JWT token.

    Request Body : 
    {
        email: ""  ,
        password: "" 
    }

3. `GET /users/search`: This api will be use to get USER list. This API will have authentication policy applied i.e. It will require the client to provide authentication token which can be obtained via login.This api also has pagination and sorting feature.

    Query Params:

        For sorting: ?sortBy=first_name:DESC

        For pagination: ?page=1&size=5
        
        For search: ?first_name=Bhavesh&last_name&Chari


### Hosting Information

The application is hosted on cloud platform heroko.com

BASE_URL: `https://antarctica-codetest.herokuapp.com/api/v1/`