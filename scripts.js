$(document).ready(function() {

  initDatePicker();

  $('#calcButton').click(buttonClickHandler);

});


function initDatePicker() {
  $('#dateInput').datepicker({
    format: "yyyy-mm-dd",
    language: "pl"
  });
}

function buttonClickHandler() {
  var date = $('#dateInput').val();

  var yesterdayDate = new Date(new Date(date).setDate(new Date(date).getDate()-1));
  var last10daysDate = new Date(new Date(date).setDate(new Date(date).getDate()-10));

  var yesterdayDateString = moment(yesterdayDate).format('YYYY-MM-DD');
  var last10daysDateString = moment(last10daysDate).format('YYYY-MM-DD');

  console.log(yesterdayDateString);
  console.log(last10daysDateString);
  console.log(date);

  var endpointUrl = 'https://api.nbp.pl/api/exchangerates/rates/a/eur/' + last10daysDateString + '/' + yesterdayDateString + '?format=json';

  var request = $.ajax({
    url: endpointUrl,
    method: "GET",
    dataType: "json"
  });

  request.done(function(responseData) {
    console.log(responseData)
    calculateResult(responseData);
  });

  request.fail(function( jqXHR, textStatus ) {
    alert( "Request failed: " + textStatus );
  });

}

function calculateResult(responseObject)
{
  var currency = $('#currencyInput').val();
  var value = $('#valueInput').val();
  var vat = $('#vatInput').val();

  var lastElement = responseObject.rates[responseObject.rates.length - 1];

  var effectiveDate = lastElement.effectiveDate;
  var mid = lastElement.mid;
  var no = lastElement.no;

  var resultValue = mid * value;
  var roundedValue = Math.round((resultValue + Number.EPSILON) * 100) / 100;

  var resultVat = roundedValue * vat/100;
  var roundedVat = Math.round((resultVat + Number.EPSILON) * 100) / 100;


  console.log("Value", roundedValue, resultValue);
  console.log("VAT", roundedVat, resultVat);
}
