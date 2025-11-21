#Tursmo solo puntos turisticos.
turismo_sitios=leaflet()|>setView(-98.88704,20.47901,zoom = 09)|>addTiles(options = tileOptions(minZoom=8,opacity = 0.7))
# turismo_trata=turismo_trata|>
#   addPolygons(data=empresas_adheridas_codigo|>st_transform("EPSG:4326")|>as("Spatial"),
#               ,fillOpacity = 0,stroke = T,color = paleta_verdes(empresas_adheridas_codigo$empresas_a|>as.numeric()|>escala_01()|>trasla_a_b(0.25,1)),
#               group = "Empresas adheridas al código -")
#Modalidades del delito
#st_centroid(turismo_shp|>st_transform("EPSG:4326")|>st_union())
turismo_sitios=turismo_sitios|>addPolygons(data=municipios|>as("Spatial"),color = "black",fillOpacity = 0,weight = 1.1,dashArray = "5, 10",opacity = 0.7)|>
  addMarkers(data=sitios_turisticos_puntos|>st_cast("POINT")|>st_coordinates(),group = "Sitios Turísticos",
               icon=marker_turismo)|>
  htmlwidgets::onRender("
    function(el, x) {
      let map=this;
      function resizeMarkers() {
      var zoom = map.getZoom();
      // Cambiar el tamaño de cada marcador
      map.eachLayer(function(layer) {
        if (layer.options && layer.options.icon && layer.options.icon.options) {
          var newSize;
          if (layer.options.group === 'Viajes y Transporte' ) {
            newSize = zoom<=9?20:zoom==10?30:
            zoom==11?40:zoom==12?50:zoom==13?60:80}
          else{
            newSize = zoom<=9?12:zoom==10?20:
            zoom==11?30:zoom==12?45:zoom==13?60:70
          }
            // Ajustar el tamaño del icono
          var iconSize = [newSize, newSize];
          layer.setIcon(
            L.icon({
              iconUrl: layer.options.icon.options.iconUrl,
              iconSize: iconSize,
              iconAnchor: [iconSize[0] / 2, iconSize[1] / 2]
            })
          );
          

          
        }
      });
    }

    // Llamar a resizeMarkers en eventos de zoom y al cargar el mapa
    map.on('zoomend', resizeMarkers);
    map.whenReady(resizeMarkers);
  

}")|>addLegendImage(
  images = c("Turismo/mapa web/imagenes/turismo.png"),
  labels = c("Sitios Turísticos"),
  width = 25,
  height = 25,
  orientation = 'vertical',
  title = htmltools::tags$div(
    style = 'font-size: 20px; text-align: center;',
    'Simbología',
  ),
  position = 'bottomright'
)
turismo_sitios
saveWidget(turismo_sitios,"Github/private.gob/Tablero_indicadores turísticos/Leaflet/mapa_web_turismo_indicadores.html")
source("codigos/puras_librerias.R")
#Lo de charlie
exc=read_sf("Turismo/indicadores/lo_de_charlie/PIB y PIB Turistico 2018-2022.xlsx",as_tibble = F)
pib_tur=exc|>
  dplyr::select(Clave.de.municipio,Municipio,dplyr::contains("PIB.Turístico.Muni"))

colnames(pib_tur)[3:7]=paste("PIB Turismo",2018:2022)

#lapply(pib_tur[,3:7],FUN = function(x) min(x,na.rm=T))
write.csv(pib_tur,"Github/private.gob/Tablero_indicadores turísticos/datos/pib_turismo.csv",fileEncoding = "UTF-8")