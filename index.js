const express = require('express');
const app = express();

// app.use(express.json({ extended: false }));
app.use(express.static('./views')); 
app.set('view engine', 'ejs');
// app.set('views', './views');

// config aws dynamodb

const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: 'AKIAWC7A2VTQDDNB3Y4I',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
})

AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = 'SanPham';

const multer = require('multer');

const upload = multer();

app.get('/', (req , rep) => {
    const params = {
        TableName: tableName,
    };
    docClient.scan(params,(err,data) => {
        if(err){
            rep.send('Internal Server Error');
        }else {
            console.log('data = ', JSON.stringify(data));
            return rep.render('index', { sanPhams: data.Items });
        }
    });
    
});

app.post('/', upload.fields([]), (req, res) => {
    const { ma_Sp, ten_Sp, so_Luong } = req.body;

    const params = {
        TableName: tableName,
        Item: {
            ma_Sp,
            ten_Sp,
            so_Luong
        }
    }

    docClient.put(params, (err,data) => {
        if(err){
            res.send(err);
        }else {
            return res.redirect('/');
        }
    });
});

app.post('/delete', upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);

    if(listItems.length == 0){
        return res.redirect('/')
    }

    function onDeleteItem(index){
        const params = {
            TableName: tableName,
            Key: {
                "ma_Sp": listItems[index]
            }
        }

        docClient.delete(params, (err, data) => {
            if(err){
                res.send(err)
            }  
            else {
                if(index > 0){
                    onDeleteItem(index - 1)
                }else{
                    return res.redirect('/')
                }
            }    
        })
    }
    onDeleteItem(listItems.length - 1)    
});

app.listen(3000, () =>{
    console.log(`Example app listening on port 3000`);
});
