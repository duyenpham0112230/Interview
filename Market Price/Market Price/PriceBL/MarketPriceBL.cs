using Market_Price.Constant;
using Market_Price.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Market_Price.PriceBL
{
    public class MarketPriceBL
    {
        //private const string formattedDateTime = "dd/MM/yyyy HH:mm";
        ///// <summary>
        ///// Write data to file
        ///// </summary>
        //public async Task WriteResultToFile(string filePath, List<PriceMarket> lstPriceMarket)
        //{
        //    if (lstPriceMarket == null || lstPriceMarket.Count == 0)
        //    {
        //        return;
        //    }
        //    if (!File.Exists(filePath))
        //    {
        //        File.Create(filePath);
        //    }
        //    string result = Newtonsoft.Json.JsonConvert.SerializeObject(lstPriceMarket);
        //    byte[] encodedText = Encoding.Unicode.GetBytes(result);

        //    using (FileStream sourceStream = new FileStream(filePath, FileMode.Append, FileAccess.Write, FileShare.None, bufferSize: 4096, useAsync: true))
        //    {
        //        await sourceStream.WriteAsync(encodedText, 0, encodedText.Length);
        //    };
        //}

        ///// <summary>
        ///// Read data from file
        ///// </summary>
        ///// <param name="filePath"></param>
        ///// <returns></returns>
        //public List<PriceMarket> ReadResultInFile(string filePath)
        //{
        //    List<PriceMarket> priceMarkets = new List<PriceMarket>();
        //    if(!File.Exists(filePath))
        //    {
        //        return priceMarkets;
        //    }
        //    string fileContent = File.ReadAllText(filePath);
        //    if (string.IsNullOrEmpty(fileContent))
        //    {
        //        return priceMarkets;
        //    }
        //    priceMarkets = Newtonsoft.Json.JsonConvert.DeserializeObject<List<PriceMarket>>(fileContent);
        //    return priceMarkets;
        //}

        /// <summary>
        /// Get data filter
        /// </summary>
        /// <returns></returns>
        //public List<PriceMarket> GetFilterResult(PriceMarketGetParam marketGetParam, List<PriceMarket> lstPriceMarket)
        //{
        //    List<PriceMarket> lstPriceMarketFilter = lstPriceMarket;

        //    if (marketGetParam.fromDate.HasValue)
        //    {
        //        lstPriceMarketFilter = lstPriceMarketFilter.FindAll(x => DateTime.Parse(x.Date, System.Globalization.CultureInfo.InvariantCulture) >= marketGetParam.fromDate.Value);
        //    }
        //    if (marketGetParam.toDate.HasValue)
        //    {
        //        lstPriceMarketFilter = lstPriceMarketFilter.FindAll(x => DateTime.Parse(x.Date, System.Globalization.CultureInfo.InvariantCulture) <= marketGetParam.toDate.Value);
        //    }
        //    if (!string.IsNullOrEmpty(marketGetParam.searchPrice))
        //    {
        //        lstPriceMarketFilter = lstPriceMarketFilter.FindAll(x => x.Price.ToString().Contains(marketGetParam.searchPrice));
        //    }
        //    if (marketGetParam.expressValue.HasValue && !string.IsNullOrEmpty(marketGetParam.sortField))
        //    {
        //        System.Reflection.PropertyInfo prop = typeof(PriceMarket).GetProperty(marketGetParam.sortField);
        //        if (marketGetParam.expressValue == (int)ExpressionValue.ASC)
        //        {
        //            lstPriceMarketFilter = lstPriceMarketFilter.OrderBy(x => prop.GetValue(x)).ToList();
        //        }
        //        else if (marketGetParam.expressValue == (int)ExpressionValue.DESC)
        //        {
        //            lstPriceMarketFilter = lstPriceMarketFilter.OrderByDescending(x => prop.GetValue(x)).ToList();
        //        }
        //    }
        //    return lstPriceMarketFilter;
        //}

        public PriceMarketPagingData GetListPriceMarket(List<PriceMarket> lstPriceMarket)
        {
            PriceMarketPagingData result = new PriceMarketPagingData() { data = new List<PriceMarket>() };
            if (lstPriceMarket == null || lstPriceMarket.Count == 0)
            {
                return result;
            }
            result.data = lstPriceMarket;
            result.summaryData = GetStatistics(lstPriceMarket);
            return result;
        }

        /// <summary>
        /// Statistic
        /// </summary>
        /// <returns></returns>
        public PriceMarketSummaryData GetStatistics(List<PriceMarket> lstPriceMarket)
        {
            PriceMarketSummaryData summaryData = new PriceMarketSummaryData();
            if (lstPriceMarket.Count > 0)
            {
                summaryData.min = lstPriceMarket.Min(r => r.Price);
                summaryData.max = lstPriceMarket.Max(r => r.Price);
                summaryData.avg = lstPriceMarket.Average(r => r.Price);
                (summaryData.mostExpensiveHour, summaryData.mostExpensiveValue, summaryData.leastExpensiveHour, summaryData.leastExpensiveValue) = FindMostHour(lstPriceMarket);

            }
            return summaryData;
        }

        /// <summary>
        /// FindMostExpensiveHour
        /// </summary>
        /// <returns></returns>
        private (List<int>, double, List<int>, double) FindMostHour(List<PriceMarket> lstPriceMarket)
        {
            double maxSum = 0, minSum = 0;
            List<int> cntMostExpensive = new List<int>();
            List<int> cntLeastExpensive = new List<int>();
            if (lstPriceMarket.Count < 2)
            {
                return (null, maxSum, null, minSum);
            }
            minSum = lstPriceMarket[0].Price + lstPriceMarket[1].Price;
            for (int i = 0; i < lstPriceMarket.Count - 1; i++)
            {
                double sum = lstPriceMarket[i].Price + lstPriceMarket[i + 1].Price;
                if (sum > maxSum)
                {
                    maxSum = sum;
                    cntMostExpensive.Clear();
                    cntMostExpensive.Add(i);
                }
                else if (sum == maxSum)
                {
                    cntMostExpensive.Add(i);
                }
                if (sum < minSum)
                {
                    minSum = sum;
                    cntLeastExpensive.Clear();
                    cntLeastExpensive.Add(i);
                }
                else if (sum == minSum)
                {
                    cntLeastExpensive.Add(i);
                }
            }

            return (cntMostExpensive, maxSum, cntLeastExpensive, minSum);
        }
    }
}