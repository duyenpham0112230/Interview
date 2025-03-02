using CsvHelper;
using Market_Price.Models;
using Market_Price.PriceBL;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Market_Price.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Upload file
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public JsonResult Upload(HttpPostedFileBase fileUpload)
        {
            List<PriceMarket> lstPriceMarket = new List<PriceMarket>();
            if (fileUpload != null && fileUpload.ContentLength > 0)
            {
                int lineNumber = 0;
                List<string> errorLines = new List<string>();
                using (var reader = new StreamReader(fileUpload.InputStream))
                using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
                {
                    if (csv.Read())
                    {
                        csv.ReadHeader(); 
                    }

                    // Read records  
                    while (csv.Read())
                    {
                        lineNumber++; // Increment line number for error tracking  

                        try
                        {
                            // Attempt to get a record; this may throw an exception if it fails  
                            var item = csv.GetRecord<PriceMarket>();
                            lstPriceMarket.Add(item);
                        }
                        catch (CsvHelperException ex)
                        {
                            // Log the error message and the problematic line  
                            errorLines.Add($"Line Not Map in File {lineNumber}: {ex.Message}");
                        }
                    }
                }
                if (lstPriceMarket.Count <= 0)
                {
                    return Json(new PriceMarketPagingData(), JsonRequestBehavior.AllowGet);
                }
                //MarketPriceBL oMarketPriceBL = new MarketPriceBL();
                //string filePath = Path.Combine(Server.MapPath("~/Uploads"), Path.GetFileName(fileUpload.FileName));
                //_ = oMarketPriceBL.WriteResultToFile(filePath, lstPriceMarket);

            }
            MarketPriceBL oMarketPriceBL = new MarketPriceBL();
            var result = oMarketPriceBL.GetListPriceMarket(lstPriceMarket);
            return Json(result, JsonRequestBehavior.AllowGet);
        }
        
    }
}