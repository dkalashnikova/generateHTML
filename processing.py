# модуль, содержащий функции, выполняющие обработку слов, возвращенных ридером,
# а также генерирование групповой html-разметки для слов одной буквы

import rwFunc
from collections import namedtuple, defaultdict



# структура для хранения статистики обработки
Stat = namedtuple("Stat", ["proc_parts", "not_proc_parts"])

stat = Stat(defaultdict(list), defaultdict(list))




# функция, возвращающая параметризованную результатами обработки ее аргуметов
# функцию-генератор, выполняющую обработку слов всех частей речи с использованием
# определенных подстановочных функций, и возвращающая для дальнейшей
# обработки слово, html-шаблон для него, и подстановочные аргументы для этого слова

def words_html_args_generator(words_reader, fill_args_func_dict,
                              patt_dir_name):


    # функция, возвращающая результат выполнения подстановочной функции
    # для определенной части речи  
    def get_args(word_data):
        
        return fill_args_func_dict[word_data.part](word_data)
        

    # функция, формирующая словарь шаблонов для разных частей речи
    # из файлов, расположенных в заданной директории
    def get_pattern_dict(patt_dir_name):

        import os

        patt_dict = {}
        
        for file in os.listdir(patt_dir_name):
            
            file_name_parts = file.rpartition('.')

            if ((file_name_parts[1:3] == ('.', "html")) and
                (file_name_parts[0] in fill_args_func_dict)):
                            
                patt_dict[file_name_parts[0]] = \
                                rwFunc.read_file(patt_dir_name + "\\" + file)
                

        if len(fill_args_func_dict) != len(patt_dict):
            raise Exception("Отсутствуют шаблоны для:\n" +
                            ', '.join([part for part in fill_args_func_dict
                                       if part not in patt_dict]))

        print("Количество доступных шаблонов:", len(patt_dict))
        print("Шаблоны доступны для:", list(patt_dict.keys()))

        return patt_dict



    patt_dict = get_pattern_dict(patt_dir_name)


    # собственно функция-генератор, возвращаемая обрамляющей функцией
    def generate_words_html_args():
        
        for word_data in words_reader():

            if ((word_data.word_info != '') and (word_data.word != '')):
                
                if (word_data.part in fill_args_func_dict):

                    stat.proc_parts[word_data.part].append(word_data.word)
                    
                    yield (word_data.word, patt_dict[word_data.part],
                           get_args(word_data))

                else:
                    stat.not_proc_parts[word_data.part].append(word_data.word)

            else:
                stat.not_proc_parts[word_data.part].append(word_data.word)
                
        

    return generate_words_html_args





# функция, создающая словарь подстановочных функций, из словаря
# функций, заданных пользователем (по сути, переводит его из формы,
# удобной для задания пользователем, в форму, где ключом
# являются отдельные части речи, а не целые их кортежи, если вдруг разные части
# речи используют одинаковые подстановочные функции)

def create_fill_args_func_dict(parts_func_kwargs):

    func_dict = {} 
        
    for parts in parts_func_kwargs:

        if type(parts) is tuple:
            for part in parts:
                func_dict[part] = parts_func_kwargs[parts]

        else:
            func_dict[parts] = parts_func_kwargs[parts] 

    print("Длина словаря функций, генерирующих подстановочные аргументы:",
          len(func_dict))
    print("Ключи словаря функций:", sorted(func_dict.keys()))

    return func_dict





# функция, возвращающая параметризованную ее аргументами функцию-генератор
# html-разметок для набора слов, начинающихся с одной буквы

def letters_html_generator(words_html_args_generator, patt_dir_name):

    # считывание шаблонов для начала, конца и заполнителя промежутков
    # между словами (так, на всякий случай, сейчас он пуст) разметки одного html-файла
    header = rwFunc.read_file(patt_dir_name + "\\header.html")
    between = rwFunc.read_file(patt_dir_name + "\\between.html")
    end_page = rwFunc.read_file(patt_dir_name + "\\end_page.html")

    # собственно возвращаемая функция-генератор
    def generate_letters_html():

        words_html_args_gen = words_html_args_generator()
        (word, html_patt, args) = next(words_html_args_gen);
        
        curr_letter = word[0].lower()
        
        N = 1
        out_html = header + '\n' + html_patt.format(N, *args) + '\n'

        for (word, html_patt, args) in words_html_args_gen:
            
            if (word[0].lower() == curr_letter):
                N += 1
                out_html += (between + '\n' +
                             html_patt.format(N, *args) + '\n')
  
            else:
                yield (out_html + '\n' + end_page + '\n')
                curr_letter = word[0].lower()
                N = 1
                out_html = header + '\n' + \
                           html_patt.format(N, *args) + '\n'

        else:
            yield (out_html + '\n' + end_page + '\n')
            


    return generate_letters_html
        
            



