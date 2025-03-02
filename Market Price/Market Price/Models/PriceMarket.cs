using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CsvHelper.Configuration.Attributes;

namespace Market_Price.Models
{
    public class PriceMarket
    {
        [Name("Date")]
        public string Date { get; set; }
        [Name("Market Price EX1")]
        public double Price { get; set; }
    }
}