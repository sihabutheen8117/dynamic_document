import express from "express";
import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import cors from 'cors'

const app = express();

app.use(express.json());

//http://localhost:4000
//https://dynamic-document.onrender.com
const corsOptions = {
    origin : ['https://dynamic-document.onrender.com'],
 }

app.use( cors(corsOptions) )


app.post("/quotation", (req, res) => {
    // Data matching your template field names

    const data = req.body ;
    console.log(data);

    const services = {
        "CLEANING" : "41:4103" ,
        "PLUMBING" : "41:4105" ,
        "PAINTING" : "41:4107" ,
        "AC/ VENTILATION MAINTENANCE" : "41:4108" ,
        "CARPENTARY" : "41:4109" ,
        "ELECTRICAL" : "41:4111" ,
        "WATER SUPPLY MAINTENANCE" : "41:4113" ,
        "CIVIL" : "41:4114" ,
        "OTHERS" : "41:5000" ,
    }


    function formatDate() {
        const d = new Date();
      
        let day = String(d.getDate()).padStart(2, "0");
        let month = String(d.getMonth() + 1).padStart(2, "0"); 
        let year = d.getFullYear();
      
        return `${day}/${month}/${year}`;
      }

      function yearAndMonth() {
        const d = new Date();
        let month = String(d.getMonth() + 1).padStart(2, "0"); 
        let year = d.getFullYear();
      
        return `${year}-${month}-`;

      }

    // const items = [
    //     {
    //         sl_no: 1,
    //         item_code: "41:4114:411418",
    //         desc: "Floor water proofing damage rectification work including removal of existing floor tiles and disposal of debris, then apply water proofing treatment",
    //         qty: 2.78,
    //         u_price: 577.50,
    //         t_price: 1605.45
    //     },
    //     {
    //         sl_no: 2,
    //         item_code: "41:4114:411421",
    //         desc: "Porcelain floor tile (RAK) - supply and installation 300x300mm",
    //         qty: 2.5,
    //         u_price: 89.25,
    //         t_price: 223.13
    //     },
    //     {
    //         sl_no: 3,
    //         item_code: "41:4114:411422",
    //         desc: "Porcelain floor tile (RAK) - supply and installation 600x600mm",
    //         qty: 1.98,
    //         u_price: 131.25,
    //         t_price: 259.88
    //     },
    //     {
    //         sl_no: 4,
    //         item_code: "N/A",
    //         desc: "Supply and installation of shower glass with accessories",
    //         qty: "LS",
    //         u_price: 1910.00,
    //         t_price: 1910.00
    //     },
    //     {
    //         sl_no: 5,
    //         item_code: "41:4109:410949",
    //         desc: "Door Frame repairing",
    //         qty: 1,
    //         u_price: 225.31,
    //         t_price: 225.31
    //     },
    // ];

    const items = data.items ;


    // Additional template data
    const work_order_no = data.work_order_no;
    const client_req_no = data.client_req_no ;
    const box_no = data.box_no ;
    const date = formatDate() ;

    const total = items.reduce((sum, item) => sum + item.t_price, 0);
    const vat = ( total * ( 1 / 20 ) ) ;
    const g_total = (vat+total).toFixed(2);
    const ref_no = "NBC-" + yearAndMonth() + client_req_no + "-KH" 
    console.log("g_total : " + g_total )

    try {
        const content = fs.readFileSync("./template/faris_xcel.docx", "binary");
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { 
            paragraphLoop: true, 
        });
        
        doc.setData({
            work_order_no,
            client_req_no,
            box_no ,
            date,
            total ,
            vat ,
            ref_no ,
            g_total,
            items
        });

        doc.render();

        const buffer = doc.getZip().generate({ type: "nodebuffer" });
        
        res.setHeader("Content-Type",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.setHeader("Content-Disposition", "attachment; filename=quotation_generated.docx");
        res.send(buffer);
        
        console.log("✅ Quotation generated successfully");
    } catch (err) {
        console.error("❌ Error:", err);
        if (err.properties && err.properties.errors) {
            console.log(JSON.stringify(err.properties.errors, null, 2));
        }
        return res.status(500).send("Template rendering error: " + err.message);
    }
});

app.listen(4000, () => console.log("🚀 Server running on http://localhost:4000"));