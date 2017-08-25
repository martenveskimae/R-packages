# Based on Franzk's Visualizing The R Packages Galaxy: http://www.pieceofk.fr/?p=408

library(igraph)
library(tidyverse)
set.seed(100)

df = available.packages()

dat.imports = paste(df[, "Imports"],df[, "Depends"],sep = ", ") %>%
  as.list() %>%
  lapply(function(x) {
    x %>%
      gsub("\\(([^\\)]+)\\)", "", .) %>%
      gsub("\n", "", .) %>%
      gsub(" ", "", .) %>%
      strsplit(., split = ",") %>%
      .[!. %in% c("NA", "R")] %>%
      unlist()
  })

names(dat.imports) = rownames(df)

base.packages = c("base", "compiler", "datasets", "graphics", "grDevices",
                  "grid", "methods", "parallel", "splines", "stats",
                  "stats4", "tcltk", "tools", "translations", "utils",
                  "KernSmooth", "MASS", "Matrix", "boot", "class", "cluster",
                  "codetools", "foreign", "lattice", "mgcv", "nlme", "nnet",
                  "rpart", "spatial", "survival")

exp = paste(paste0("\\b",base.packages,"\\b"), collapse = "|")
base = names(dat.imports)[sapply(dat.imports, function(x) { mean(grepl(exp,x))!=0 })]

sub = dat.imports %>%
  graph.edgelist() %>%
  induced_subgraph(., which(names(V(.))%in%c("R",base))) %>%
  subgraph.centrality()

save(sub, file="sub.Rda")
save(dat.imports, file="dat.Rda")
