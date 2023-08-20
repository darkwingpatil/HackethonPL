const fs = require('fs');
const csv = require('csv-parser');
const {add_code_lab_data_init}=require("./dataHandler")

export async function seedData() {
    try {
      fs.createReadStream('codelabsdata.csv')
        .pipe(csv())
        .on('data', async (row:any) => {

          console.log(row)
          await add_code_lab_data_init(row)
        })
        .on('end', async() => {
         // await mongoose.disconnect();
          console.log('Data seeding complete.');
        });
    } catch (error) {
      console.error('Error seeding data:', error);
      await process.exit(1);
    }
  }
  

  
  
  
  
  
  
  