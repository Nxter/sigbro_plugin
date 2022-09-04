/******************************************************************************
 * Copyright © 2013-2016 The Nxt Core Developers.                             *
 * Copyright © 2016-2022 Jelurida IP B.V.                                     *
 *                                                                            *
 * See the LICENSE.txt file at the top-level directory of this distribution   *
 * for licensing information.                                                 *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement with Jelurida B.V.,*
 * no part of this software, including this file, may be copied, modified,    *
 * propagated, or distributed except according to the terms contained in the  *
 * LICENSE.txt file.                                                          *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

/**
 * @depends {nrs.js}
 */
var NRS = (function(NRS, $, undefined) {

	NRS.setup.p_sigbro_plugin = function () {

    $('#send_money_do_not_broadcast').prop('checked', true);
    $('#send_message_do_not_broadcast').prop('checked', true);
    $('#send_money_do_not_sign').prop('checked', true);
    $('#send_message_do_not_sign').prop('checked', true);

    $('.secret_phrase').remove();

    var findJSON;
    var send = 0;


    findJSON = setInterval(function () {

      if (send > 0) {
        clearInterval(findJSON);
        return;
      }

      // NRS.logConsole("Waiting for the unsigned transaction...");
      var unsignJSON = $('#raw_transaction_modal_transaction_json').val();
      if (unsignJSON.length > 100) {
        send++;
        NRS.logConsole("Found unsigned TX to sign & send...")

        let parsedUnsignedJSON = JSON.parse(unsignJSON);
				// NRS.logConsole("UnsignedJSON: ", parsedUnsignedJSON);

        let unsigned_bytes = $('#raw_transaction_modal_unsigned_transaction_bytes').val();
        let save_tx_url = "https://random.api.nxter.org/api/v3/save_tx";

        var unsigned_json = {};
        unsigned_json["transactionJSON"] = parsedUnsignedJSON
        unsigned_json["unsignedTransactionBytes"] = unsigned_bytes;

        //NRS.logConsole("----------debug-----------");
        //NRS.logConsole(unsigned_json);

        $.ajax({
            type: "POST",
            url: save_tx_url,
            dataType: 'json',
            contentType: "application/json",
            async: false,
            data: JSON.stringify(unsigned_json),
            success: function (response) {
              NRS.logConsole("----------sigbro service response-----------");
              console.log(response);


              if (response.uuid) {
                $('#raw_transaction_modal_unsigned_bytes_qr_code_container').html('<strong>SIGBRO QR CODE</strong><div id="raw_transaction_modal_sigbro_qr_code"></div>');

                tx_url = "https://random.api.nxter.org/api/v3/load_tx/" + response.uuid;
                NRS.logConsole("----------sigbro request URL-----------");
                NRS.logConsole(tx_url);

                var type = 2;
                var cellSize = 4;
                while (type <= 40) {
                  try {
                    var qr = qrcode(type, 'M');
                    qr.addData(tx_url);
                    qr.make();
                    var img = qr.createImgTag(cellSize);
                    NRS.logConsole("Encoded QR code of type " + type + " with cell size " + cellSize);
                    $('#raw_transaction_modal_sigbro_qr_code').empty().append(img);
                    return img;
                  } catch (e) {
                    NRS.logConsole("Try to encode QR code with type " + type);
                    type++;
                  }
                }
              } else {
                // can not save json. 
                NRS.logConsole("Sorry. Sigbro can not generate QR code for the transaction. Write us, please.");
                return 2;
              }

            } 
          });
      }
    }, 500);
  };

	return NRS;
}(NRS || {}, jQuery));

//File name for debugging (Chrome/Firefox)
//@ sourceURL=nrs.sigbro_main.js