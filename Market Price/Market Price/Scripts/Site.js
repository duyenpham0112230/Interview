function fnPriceMarket() {
    return {
        rootSelector: '.price-market',
        _dataTable: $("#tblMarketPrice").DataTable({
            pageLength: 100,
            lengthMenu: [25, 50, 100, 150],
            columnDefs: [
                {
                    targets: [0],
                    render: function (data, type, row) {
                        if (type == 'display') {
                            return row[2];
                        }
                        if (type === 'sort') {
                            return row[0];
                        }
                        return data;
                    }

                },
                {
                    targets: [2],
                    visible: false
                }
            ],
            drawCallback: function (settings) {
                let api = this.api();
                if (window['oPriceMarket'] && typeof (window['oPriceMarket'].drawCallbackCustom) == 'function') {
                    oPriceMarket.drawCallbackCustom(api, settings);
                }
            }
        }),

        /**
         * start method
         * ptduyen 27.02.2025
         * */
        init: function () {
            let me = this;
            me.initEvent();
        },

        /**
         * handle event for selectors
         * ptduyen 27.02.2025
         * */
        initEvent: function () {
            let me = this;
            $('#filePath').on('change', function (e) {
                let file = this.files[0];
                if (file) {
                    me.updateFileName(file);
                }
            })
            $('#viewGraph').on('click', function () {
                let strFromDate = $(me.rootSelector + ' input[name=FromDate]').val();
                strFromDate = strFromDate ? me.fomatDate(strFromDate) : '';
                let strToDate = $(me.rootSelector + ' input[name=ToDate]').val();
                strToDate = strToDate ? me.fomatDate(strToDate) + ' 23:59' : '';

                if (strFromDate || strToDate) {
                    me.renderGraphByDate(strFromDate, strToDate);
                }
            })
        },

        /**
         * format str input to string formatted
         * @param {any} strDate
         */
        fomatDate: function (strDate, formatDate, originDate) {

            let [year, month, day] = strDate.split('-');
            switch (originDate) {
                case 'dd/MM/yyyy':
                    [day, month, year] = strDate.split('/');
            }
            if (!formatDate) {
                formatDate = 'dd/MM/yyyy';
            }
            switch (formatDate) {
                case 'yyyy-MM-dd':
                    return `${year}-${month}-${day}`;
                case 'dd/MM/yyyy':
                default:
                    return `${day}/${month}/${year}`;
            }
        },

        /**
         * strDate dd/MM/yyyy (HH:mm) to DateTime
         * @param {any} strDate
         */
        parseDateTime: function (strDate) {
            var parts = strDate.split(' ');
            if (parts.length == 1) {
                parts.push('00:00');
            }
            if (parts.length == 2) {
                var dateParts = parts[0].split('/');
                var timeParts = parts[1].split(':');
                if (dateParts.length === 3 && timeParts.length === 2) {
                    var day = parseInt(dateParts[0], 10);
                    var month = parseInt(dateParts[1], 10) - 1;  
                    var year = parseInt(dateParts[2], 10);
                    var hour = parseInt(timeParts[0], 10);
                    var minute = parseInt(timeParts[1], 10);

                    return new Date(year, month, day, hour, minute);
                }
            }
            return null;
        },

        /**
         * change file 
         * ptduyen 27.02.2025
         * */
        updateFileName: function (file) {
            let me = this;
            let fileNameDisplay = $('#fileName');
            if (file) {
                fileNameDisplay.text(file.name);
                $(me.rootSelector + ' #viewResult').show();
                me.renderData(file);
            }
            else {
                fileNameDisplay.text('No file chosen');
                $(me.rootSelector + ' #viewResult').hide();
                $(me.rootSelector + ' .div-data').hide();
            }
        },

        drawCallbackCustom: function (api, settings) {
            let me = this;
            let cntTable = api.rows({ filter: 'applied' }).count();
            if (cntTable > 100) {
                let pageCurrent = api.rows({ page: 'current' }).data().toArray();
                if (pageCurrent && pageCurrent.length > 0) {
                    let dateFilter = pageCurrent[0][2].split(' ')[0];
                    let dataDateCurrent = me.PriceMarketData.data.filter(x => x.Date.includes(dateFilter));
                    $(me.rootSelector + ' input[type=date]').val(me.fomatDate(dateFilter, 'yyyy-MM-dd', 'dd/MM/yyyy'));
                    me.renderGraph(dataDateCurrent, dateFilter);
                }
            }
            else {
                let dataArray = api.rows({ filter: 'applied' }).data().toArray();
                if (dataArray.length > 0) {
                    let fromDate = me.fomatDate(dataArray[0][2].split(' ')[0], 'yyyy-MM-dd', 'dd/MM/yyyy');
                    let toDate = me.fomatDate(dataArray[dataArray.length - 1][2].split(' ')[0], 'yyyy-MM-dd', 'dd/MM/yyyy');
                    $(me.rootSelector + ' input[name=FromDate]').val(fromDate);
                    $(me.rootSelector + ' input[name=ToDate]').val(toDate);
                    me.renderGraph(dataArray);
                }
            }
        },

        renderData: function (file) {
            let me = this;
            let formData = new FormData();
            formData.append("FileUpload", file);
            $.ajax({
                type: 'POST',
                url: '/Home/Upload',
                data: formData,
                contentType: false,
                processData: false,
                success: function (result) {
                    $(me.rootSelector + ' .div-data').show();
                    me.PriceMarketData = result;
                    if (me.PriceMarketData.data) {
                        me.PriceMarketData.data.forEach(function (item) {
                            item.DateTime = me.parseDateTime(item.Date);
                        })
                    }
                    me.renderTable();
                    me.renderStatistic();
                    //me.renderGraph();
                },
                error: function (error) {
                    $(me.rootSelector + ' .div-data').hide();
                }
            });
        },

        renderTable: function () {
            let me = this;
            me._dataTable.clear();
            if (me.PriceMarketData && me.PriceMarketData.data) {
                let dataArray = me.PriceMarketData.data.map(x => [x.DateTime, x.Price, x.Date]);
                me._dataTable.rows.add(dataArray).draw();
            }
        },

        renderGraph: function (dataGraph, dateFilter) {
            //if (!dataGraph || dataGraph.length == 0) {
            //    return;
            //}
            let labels, prices;
            if (dataGraph[0] instanceof Array) {
                labels = dataGraph.map(item => item[2]);
                prices = dataGraph.map(item => item[1]);
            }
            else {
                labels = dataGraph.map(item => item.Date);
                prices = dataGraph.map(item => item.Price);
            }
            let stepSize = Math.ceil(dataGraph.length / 12);
            // Create the chart  
            let ctx = document.getElementById('chart-marketprice').getContext('2d');
            let title = 'Market Price Over Time ';
            let titleGraph = dateFilter ? title + dateFilter : title + ' Filtered';
            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: titleGraph,
                        data: prices,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 1,
                        pointRadius: 1,
                        fill: true,
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Price'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date and Time'
                            },
                            ticks: {
                                stepSize: stepSize
                            }
                        }
                    },
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        },
                    }
                }
            });
        },

        renderGraphByDate: function (fromDate, toDate) {
            let me = this;
            if (!me.PriceMarketData.data || me.PriceMarketData.data.length == 0) {
                return;
            }
            let dataGraph = [...me.PriceMarketData.data];
            let textDateFilter = [];
            if (fromDate) {
                dataGraph = dataGraph.filter(x => x.DateTime >= me.parseDateTime(fromDate));
                textDateFilter.push(fromDate);
            }
            if (toDate) {
                dataGraph = dataGraph.filter(x => x.DateTime <= me.parseDateTime(toDate));
                textDateFilter.push(toDate);
            }
            textDateFilter = textDateFilter.join(' - ');
            me.renderGraph(dataGraph, textDateFilter);
        },

        renderStatistic: function () {
            let me = this;
            if (me.PriceMarketData && me.PriceMarketData.summaryData) {
                let summaryData = me.PriceMarketData.summaryData;
                $(me.rootSelector + ' .min-value').text(summaryData.min.toFixed(8));
                $(me.rootSelector + ' .avg-value').text(summaryData.avg.toFixed(8));
                $(me.rootSelector + ' .max-value').text(summaryData.max.toFixed(8));

                $(me.rootSelector + ' .most-value').text(summaryData.mostExpensiveValue.toFixed(8));
                $(me.rootSelector + ' .least-value').text(summaryData.leastExpensiveValue.toFixed(8));

                if (me.PriceMarketData.data && me.PriceMarketData.data.length > 1) {
                    if (summaryData.mostExpensiveHour) {
                        let mostExpensive = [];
                        for (var i = 0; i < summaryData.mostExpensiveHour.length; i++) {
                            mostExpensive.push(me.PriceMarketData.data[summaryData.mostExpensiveHour[i]].Date + ' - ' + me.PriceMarketData.data[summaryData.mostExpensiveHour[i] + 1].Date);
                        }
                        let txtMostExpensive = mostExpensive.join(', ');
                        $(me.rootSelector + ' .most-position').attr('title', txtMostExpensive);
                        if (mostExpensive.length > 4) {
                            txtMostExpensive = mostExpensive[0] + ', ' + mostExpensive[1] + ', ' + mostExpensive[2] + ', ' + mostExpensive[3] + ',...';
                        }
                        $(me.rootSelector + ' .most-position').text(txtMostExpensive);
                    }
                    if (summaryData.leastExpensiveHour) {
                        let leastExpensive = [];
                        for (var i = 0; i < summaryData.leastExpensiveHour.length; i++) {
                            leastExpensive.push(me.PriceMarketData.data[summaryData.leastExpensiveHour[i]].Date + ' - ' + me.PriceMarketData.data[summaryData.leastExpensiveHour[i] + 1].Date);
                        }
                        let txtLeastExpensive = leastExpensive.join(', ');
                        $(me.rootSelector + ' .least-position').attr('title', txtLeastExpensive);
                        if (leastExpensive.length > 4) {
                            txtLeastExpensive = leastExpensive[0] + ', ' + leastExpensive[1] + ', ' + leastExpensive[2] + ', ' + leastExpensive[3] + ',...';
                        }
                        $(me.rootSelector + ' .least-position').text(txtLeastExpensive);
                    }
                }
            }
        },
    }
}

$(document).ready(function () {
    var oPriceMarket = fnPriceMarket();
    window['oPriceMarket'] = oPriceMarket;
    oPriceMarket.init();
})