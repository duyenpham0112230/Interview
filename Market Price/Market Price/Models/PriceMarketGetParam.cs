using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Market_Price.Models
{
    public class PriceMarketSummaryData
    {
        public double min { get; set; } = 0;
        public double max { get; set; } = 0;
        public double avg { get; set; } = 0;
        public List<int> mostExpensiveHour { get; set; }
        public double mostExpensiveValue { get; set; } = 0;
        public List<int> leastExpensiveHour { get; set; }
        public double leastExpensiveValue { get; set; } = 0;
    }

    public class PriceMarketPagingData
    {
        public List<PriceMarket> data { get; set; }

        public PriceMarketSummaryData summaryData { get; set; }
    }
}