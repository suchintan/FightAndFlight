from bottle import route, run

from consider import Consider
con = Consider()

@route('/ESenseData.json')
def ESenseData():
	from bottle import response, request
	from json import dumps
	response.content_type = 'application/json'

	packet = con.get_packet()
	callback = request.query['callback']
	return ( callback + '(' + str(packet).replace("\'", "\"")+')')


@route('/ESenseData2.json')
def ESenseData2():
	from bottle import response, request
	from json import dumps
	response.content_type = 'application/json'

	packet = con.get_packet()
	# callback = request.query['callback']
	return ( str(packet).replace("\'", "\""))

run(host='localhost', port=8080, debug=True)