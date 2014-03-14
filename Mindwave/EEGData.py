from bottle import route, run
from time import time

from consider import Consider
con = Consider()

@route('/ESenseData.json')
def ESenseData():
	from bottle import response, request
	from json import dumps
	response.content_type = 'application/json'

	packet = con.get_packet()
	callback = request.query['callback']

	EsenseDataCSV(packet)
	

	return ( callback + '(' + str(packet).replace("\'", "\"")+')')

def EsenseDataCSV(data):
	epoch_time = int(time.time())
	with open('Graph.csv', 'a') as file:
		file.write(str(epoch_time + ',' + str(data.attention) 
			+ ',' + str(data.meditation)+ '\n')

	return ();

run(host='localhost', port=8080, debug=True)