# модуль, содержащий функции чтения из таблицы, файлов, и записи в файлы


# счетчик считанных из таблицы строк
read_str_counter = 0



# функция, возвращающая параметризованную таблицей, которую нужно читать,
# функцию-ридер

def words_reader(table):
    
    nrows = table.nrows
    

    from collections import namedtuple

    FormInfo = namedtuple("FormInfo",
                          ["form", "gramm_info", "reference"])

    WordInfo = namedtuple("WordInfo",
                          ["word", "part", "word_info", "forms_list"])

    
    # возвращаемая функция-ридер, возвращает за раз по одному слову,
    # со всей информацией о нем, включая его формы, в виде структур,
    # определенных выше
    def read():
        
        curr_word = table.row_values(0)[0].strip(' \n')
        curr_part = table.row_values(0)[2].strip(' \n').partition(',')[0].strip('.')
        word_forms_list = []

        for i in range(nrows):

            val =  list(map(lambda el: el.strip(' \n'),
                            table.row_values(i)))

            global read_str_counter
            read_str_counter = i + 1
            
            word = val[0]
            part = val[2].partition(',')[0].strip('.')

            if not ((word == curr_word) and (part == curr_part)):
                
                yield WordInfo(curr_word, curr_part,
                               table.row_values(i - 1)[2].strip(' \n'),
                               word_forms_list)
                curr_word = word
                curr_part = part
                word_forms_list = []


            ftrs_lists = list(map(lambda ftrs:
                                  list(map(lambda s: s.strip('. '),
                                           ftrs.split(','))),
                                  val[3].split('|')))

            for ftrs_list in ftrs_lists:                
                if '' in ftrs_list:
                    ftrs_list.remove('')

            word_forms_list += [FormInfo(val[1], f_list, val[4])
                                for f_list in ftrs_lists]
                
    
        else:
            yield WordInfo(curr_word, curr_part,
                           table.row_values(i)[2].strip(' \n'),
                           word_forms_list)
            

    return read






# функция для записи сгенерированной html-разметки в файлы
def write_to_files(letters_html_generator, out_dir_name):

    N = 0

    for letter_html in letters_html_generator():

        N += 1

        with open(out_dir_name + "\\grammar" + str(N) + ".html",
                  "wt", encoding = "utf8") as fout:
            fout.write(letter_html)






# вспомогательная функция, читающая все содержимое файла с именем filename
def read_file(filename):
    
    with open(filename, "rt", encoding = 'utf-8') as fin:
        
        return fin.read()

            


