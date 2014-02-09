(ns helloworld
  (:require [ring.adapter.jetty :as jetty]
            [compojure.core :refer [defroutes GET]]))

(defroutes handler
  (GET "/" []
       {:headers {"Content-type" "text/plain; charset=UTF-8"}
        :body "Hello world!"}))

(defn -main []
  (jetty/run-jetty handler
                   {:port (Integer. (or (System/getenv "PORT") "8080"))
                    :join? false}))