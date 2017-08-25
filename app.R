library(shiny)
library(igraph)
library(tidyverse)

load("dat.Rda")
load("sub.Rda")

tidy = dat.imports[["tidyverse"]]

dat.imports = dat.imports %>%
  stack() %>%
  as.matrix() %>%
  .[-which(.[, 1] %in% c("", "NA")), ]

graph = dat.imports %>%
  graph.edgelist() %>%
  decompose.graph() %>%
  .[[which(sapply(., vcount) == max(sapply(., vcount)))]] %>%
  igraph::as_data_frame("edges") %>%
  setNames(c("source", "target"))

ui = fluidPage(
  tags$head(tags$script(src="https://d3js.org/d3.v4.min.js")),
  tags$head(tags$script(src="forceLayout.js")),
  title = "Draggable R packages",
  uiOutput("universe"),
  HTML(paste("<div id='packages'></div>
             <script>init()</script>")),
  hr(),
  column(width=12,align="center",
         radioButtons("type", "", c("base R", "tidyverse"), "base R", inline=T),
         sliderInput("size","nodes",
                     min = 0,
                     max = 1200,
                     step = 50,
                     value = 600)
  )
)

server = function(input, output, session) {
  inputs = reactive({paste(input$size , input$type)})
  update = eventReactive(inputs(),{
    if(input$type=="tidyverse"){
      tmp = graph %>% filter((source=="R" & target %in% tidy) | source %in% tidy )
      tmp = tmp[sample(1:nrow(tmp), input$size),]
    } else {
      tmp = graph %>% filter((source=="R" &
                              target %in% names(sub[order(-sub)])[2:433]) |
                              source %in% names(sub[order(-sub)])[2:433])
      tmp = tmp[sample(1:nrow(tmp), input$size),]
    }
    session$sendCustomMessage(type="df", tmp)
  })
  
  output$universe = renderUI({
    update()
  })
}

shinyApp(ui = ui, server = server)

