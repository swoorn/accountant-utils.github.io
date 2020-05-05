$(document).ready(function() {

  initDatePicker();

  $('#calcButton').click(buttonClickHandler);

});


function initDatePicker()
{
  $('#dateInput').datepicker({
    format: "yyyy-mm-dd",
    language: "pl",
    autoclose: true,
    endDate: "0d",
    showWeekDays: false,
  });
}

function buttonClickHandler()
{
  $('#resultDiv').addClass('d-none');

  var date = $('#dateInput').val();
  var value = $('#valueInput').val();
  var currency = $('#currencyInput').val();
  currency = currency.toLowerCase();

  var isDateValid = validateDate(date);
  var isValueValid = validateValue(value);

  if (!isDateValid || !isValueValid) {
    return;
  }

  // TODO: dac timezone na polske
  var yesterdayDate = new Date(new Date(date).setDate(new Date(date).getDate()-1));
  var last10daysDate = new Date(new Date(date).setDate(new Date(date).getDate()-10));

  var yesterdayDateString = moment(yesterdayDate).format('YYYY-MM-DD');
  var last10daysDateString = moment(last10daysDate).format('YYYY-MM-DD');

  var endpointUrl = 'https://api.nbp.pl/api/exchangerates/rates/a/' + currency + '/' + last10daysDateString + '/' + yesterdayDateString + '?format=json';

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

function calculateResult (responseObject) {
  var value = $('#valueInput').val();
  value = value.replace(/,/g, '.');
  var vat = $('#vatInput').val();

  var lastElement = responseObject.rates[responseObject.rates.length - 1];

  var effectiveDate = lastElement.effectiveDate;
  var mid = lastElement.mid;
  var no = lastElement.no;

  var resultValue = mid * value;
  var roundedValue = Math.round((resultValue + Number.EPSILON) * 100) / 100;

  var resultVat = roundedValue * vat / 100;
  var roundedVat = Math.round((resultVat + Number.EPSILON) * 100) / 100;


  $('#tableNumberDiv').html(no);
  $('#rateDateDiv').html(effectiveDate);
  $('#rateDiv').html(mid);
  $('#resultValueDiv').html(roundedValue + " zł");
  $('#resultVatDiv').html(roundedVat + " zł");
  $('#vatPercentSpan').html(vat + "%");

  $('#resultDiv').removeClass('d-none');
}


function validateDate(date)
{
  // walidacja daty
  if (moment(date).isValid() === false) {
    $('#dateInput').addClass("is-invalid");
    return false;
  } else {
    $('#dateInput').removeClass("is-invalid");
    return true;
  }
}

function validateValue(value)
{
  value = value.replace(/,/g, '.');
  // walidacja kwoty
  if (!!value && Number.isNaN(Number(value).valueOf()) === true) {
    $('#valueInput').addClass("is-invalid");
    return false;
  } else {
    $('#valueInput').removeClass("is-invalid");
    return true;
  }
}
